import * as PIXI from 'pixi.js';
import anime from 'animejs';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';
import { testForAABB } from '../util/Physics';
import GameConfig from '../config/GameConfig';
import { getPlayerIndexAfterScore } from '../util/GameHelpers';
import Keyboard from './Keyboard';
import Background from './Background';
import {
  Collision,
  GameStateFn,
  GAME_STATE,
  NewBallState,
  NewPlayerState,
  Score,
} from '../types/types';
import { rand } from '../util/MathHelpers';
import {
  sendBallUpdate,
  sendFinishGame,
  sendMovePlayer,
  sendStartRound,
} from './Remote';
import { gameState$ } from '../services/GameStore';

type Ball = PIXI.Sprite & {
  vx: number;
  vy: number;
};

export default class Game {
  private static instance: Game | undefined;

  app: PIXI.Application;
  player1: PIXI.Sprite;
  player2: PIXI.Sprite;
  ball: Ball;
  border: PIXI.Graphics;
  scoreText: PIXI.Text;
  countDown: PIXI.Text;
  keyObject: Keyboard;
  background: Background;
  stopped = false;
  score: Score = [0, 0];
  countDownStartTime = -1;
  countDownTime = -1;

  player1Hitarea!: PIXI.Graphics;
  dragData: PIXI.InteractionData | undefined;
  dragging = false;

  master = false;

  GAME_STATE_FN_MAPPING: { [key in GAME_STATE]: GameStateFn | undefined };

  private constructor() {
    this.play = this.play.bind(this);
    this.startRoundState = this.startRoundState.bind(this);

    this.GAME_STATE_FN_MAPPING = {
      [GAME_STATE.pause]: undefined,
      [GAME_STATE.play]: this.play,
      [GAME_STATE.start_round]: this.startRoundState,
    };

    this.app = new PIXI.Application({
      width: GameConfig.screen.width,
      height: GameConfig.screen.height,
    });

    // Create background
    this.background = new Background(this.app);

    // border
    this.border = new PIXI.Graphics();
    this.border.lineStyle(1, 0xfeeb77, 1);
    this.border.drawRect(
      GameConfig.screen.padding,
      GameConfig.screen.padding,
      this.app.view.width - GameConfig.screen.padding * 2,
      this.app.view.height - GameConfig.screen.padding * 2,
    );
    this.border.endFill();

    this.app.stage.addChild(this.border);

    // players
    this.player1 = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.player2 = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.player1.tint = 0x123456;
    this.player1.width = this.player2.width = GameConfig.player.width;
    this.player1.height = this.player2.height = GameConfig.player.height;
    this.player1.anchor.set(0.5);
    this.player2.anchor.set(0.5);
    this.resetPlayerPositions();
    this.initPlayer1Hitarea();
    this.player1.name = GameConfig.player.local.id;
    this.player2.name = GameConfig.player.remote.id;
    this.player1.interactive = true;
    this.player1.on('mousemove', (event: PIXI.InteractionEvent) =>
      this.onMouseMove(this.player1, event),
    );
    this.player1.on('touchstart', (event: PIXI.InteractionEvent) => {
      this.player1.alpha = 0.5;
      this.dragData = event.data;
      this.dragging = true;
      event.stopPropagation();
    });
    this.player1.on('touchmove', () => {
      if (this.dragData && this.dragging && !this.stopped) {
        const newPosition = this.dragData.getLocalPosition(this.player1.parent);

        if (newPosition.y > 0 && newPosition.y < this.app.view.height) {
          sendMovePlayer({ y: newPosition.y });
          this.player1.y = newPosition.y;
        }
      }
    });
    const touchend = () => {
      console.log('touchend');
      this.player1.alpha = 1.0;
      this.dragData = undefined;
      this.dragging = false;
    };
    this.player1.on('touchend', touchend);
    this.player1.on('touchendoutside', touchend);

    this.app.stage.addChild(this.player1, this.player2);

    // score text
    this.scoreText = new PIXI.Text(
      this.getScoreText(),
      GameConfig.ui.textStyle,
    );
    this.scoreText.x = GameConfig.screen.width / 2;
    this.scoreText.y = GameConfig.screen.height - GameConfig.screen.padding;
    this.scoreText.anchor.set(0.5);

    this.app.stage.addChild(this.scoreText);

    // ball
    this.ball = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.ball.anchor.set(0.5);
    this.resetBall();

    this.app.stage.addChild(this.ball);

    // Start round Countdown
    this.countDown = new PIXI.Text('', GameConfig.ui.textStyle);
    this.countDown.x = GameConfig.screen.width / 2;
    this.countDown.y = GameConfig.screen.height / 2;
    this.countDown.anchor.set(0.5);

    this.app.stage.addChild(this.countDown);

    // Keyboard Interactions
    // Space to suspend/resume game loop
    this.keyObject = new Keyboard(' ');
    this.keyObject.release = () => {
      console.log('Suspend/Resume');
      if (this.stopped) {
        this.app.start();
        this.stopped = false;
      } else {
        this.app.stop();
        this.stopped = true;
      }
    };

    // set state
    gameState$.next(GAME_STATE.pause);

    // debug
    // this.app.stop();
    // this.stopped = true;

    //Start the game loop
    this.app.ticker.add((delta) => this.gameLoop(delta));

    console.log('player1:', this.player1);
    console.log('player2:', this.player2);
    console.log('ball', this.ball);
    console.log('border', this.border);
  }

  static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  // Interaction
  onMouseMove(sprite: PIXI.Sprite, event: PIXI.InteractionEvent): void {
    const newPosition = event.data.getLocalPosition(sprite.parent);
    if (
      !this.stopped &&
      newPosition.y > 0 &&
      newPosition.y < this.app.view.height
    ) {
      sendMovePlayer({ y: newPosition.y });
      sprite.y = newPosition.y;
    }
  }

  private initPlayer1Hitarea(): void {
    const hitarea = new PIXI.Graphics();
    hitarea.lineStyle(1, 0xfeeb77, 1);
    hitarea.drawRect(
      -(
        GameConfig.player.width / 2 +
        (this.player1.x < GameConfig.screen.width / 2 ? 0 : 30)
      ),
      -(GameConfig.player.height / 4) / 2,
      GameConfig.player.width + 30,
      GameConfig.player.height / 4,
    );
    hitarea.endFill();
    this.player1Hitarea = hitarea;
    this.player1.hitArea = this.player1Hitarea.getBounds();
  }

  // Game states
  play(delta: number): void {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    const collision = this.collisionDetection();
    if (collision) {
      console.log('Collision', collision);
      this.collisionResponse(collision);
    }
  }

  startRoundState(delta: number): void {
    const elapsed = Date.now() - this.countDownStartTime;
    this.countDownStartTime = Date.now();
    this.countDownTime += elapsed;
    const countDownTextTime = Math.round(
      (GameConfig.game.countdownLength - this.countDownTime) / 1000,
    );
    if (countDownTextTime <= 0) {
      this.countDown.visible = false;
      gameState$.next(GAME_STATE.play);
      return;
    }
    this.countDown.text = `${countDownTextTime}`;
  }

  // State transitions
  /**
   *
   * @param offset Shorten or lengthen the timer by @param offset millisecons
   */
  startRoundTransition(offset = 0): void {
    this.triggerAnimation(700);
    this.resetCountdown(offset);
    gameState$.next(GAME_STATE.start_round);
  }

  startGameTransition(offset = 0): void {
    this.resetGame();
    this.triggerAnimation(700);
    this.resetCountdown(offset);
    gameState$.next(GAME_STATE.start_round);
  }

  finishGameTransition(): void {
    this.triggerAnimation(700);
    gameState$.next(GAME_STATE.pause);
  }

  scoreTransition(): void {
    const scoreIdx = this.calcScore();
    this.resetBall();
    if (Math.max(...this.score) >= 2) {
      if (this.isRemotePlayerScoreIdx(scoreIdx)) {
        sendFinishGame(this.score);
      }
      this.finishGameTransition();
    } else {
      if (this.isRemotePlayerScoreIdx(scoreIdx)) {
        sendStartRound({ score: this.score, ball: this.getBallState() });
      }
      this.startRoundTransition();
    }
  }

  isRemotePlayerScoreIdx(scoreIdx: number): boolean {
    return (
      (scoreIdx === 0 && this.player2.x < GameConfig.screen.width / 2) ||
      (scoreIdx === 1 && this.player2.x > GameConfig.screen.width / 2)
    );
  }

  // Collision Detection and Response
  collisionDetection(): Collision | undefined {
    const ballBounds = this.ball.getBounds();
    const borderBounds = this.border.getBounds();

    // Check this.borders
    // Top this.border
    if (ballBounds.y < borderBounds.y && this.ball.vy < 0) {
      return 'top';
    }

    // Bottom this.border
    if (
      ballBounds.y + ballBounds.height > borderBounds.y + borderBounds.height &&
      this.ball.vy > 0
    ) {
      return 'bottom';
    }

    // Left this.border
    if (ballBounds.x < borderBounds.y && this.ball.vx < 0) {
      return 'left';
    }

    // Right this.border
    if (
      ballBounds.x + ballBounds.width > borderBounds.x + borderBounds.width &&
      this.ball.vx > 0
    ) {
      return 'right';
    }

    // Check this.player1
    if (
      testForAABB(this.ball, this.player1) &&
      ((this.player1.x > this.app.view.width / 2 && this.ball.vx > 0) ||
        (this.player1.x < this.app.view.width / 2 && this.ball.vx < 0))
    ) {
      return this.player1;
    }

    // Check this.player2
    if (
      testForAABB(this.ball, this.player2) &&
      ((this.player2.x > this.app.view.width / 2 && this.ball.vx > 0) ||
        (this.player2.x < this.app.view.width / 2 && this.ball.vx < 0))
    ) {
      return this.player2;
    }
  }

  collisionResponse(collisionObject: Collision): void {
    // Top and bottom borders
    if (collisionObject === 'top' || collisionObject === 'bottom') {
      this.ball.vy *= -1;
    }
    // Left and right borders
    else if (collisionObject === 'left' || collisionObject === 'right') {
      console.log('SCORE');
      this.scoreTransition();
    }
    // Local player
    else if (collisionObject === this.player1) {
      anime({
        targets: this.player1,
        x:
          this.player1.x +
          (this.player1.x < GameConfig.screen.width / 2 ? -15 : 15),
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      this.ball.vx *= -GameConfig.ball.speedUp;
      this.ball.vy *= GameConfig.ball.speedUp;

      sendBallUpdate(this.getBallState());
    }
    // Remote player
    else if (collisionObject === this.player2) {
      anime({
        targets: this.player2,
        x:
          this.player2.x +
          (this.player2.x < GameConfig.screen.width / 2 ? -15 : 15),
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      this.ball.vx *= -GameConfig.ball.speedUp;
      this.ball.vy *= GameConfig.ball.speedUp;
    }
  }

  triggerAnimation(duration = 1000): void {
    const blurFilter = new MotionBlurFilter([0, 0], 5);
    this.app.stage.filters = [blurFilter];
    const borderDisplacement = 10;
    const animation = anime({
      targets: this.border,
      x: this.border.x - borderDisplacement,
      y: this.border.y - borderDisplacement,
      width: this.border.width + borderDisplacement * 2,
      height: this.border.height + borderDisplacement * 2,
      direction: 'alternate',
      easing: 'linear',
      duration: duration + 50,
      autoplay: false,
    });
    anime({
      targets: blurFilter.velocity,
      x: 40,
      y: 10,
      direction: 'alternate',
      easing: 'linear',
      duration: duration,
      autoplay: true,
    });
    animation.restart();
    this.background.triggerWarp(duration);
    // const t = setTimeout(() => {
    //   this.app.stage.filters = [];
    //   clearTimeout(t);
    // }, duration + 50);
  }

  // Other functions
  resetBall(): void {
    this.ball.x = this.app.view.width / 2;
    this.ball.y = this.app.view.height / 2;
    this.ball.vx = rand(2.0, 5.0) * (Math.random() < 0.5 ? -1 : 1);
    this.ball.vy = rand(-2.0, 2.0);
  }

  resetScore(): void {
    this.score = [0, 0];
    this.scoreText.text = this.getScoreText();
  }

  resetGame(): void {
    this.resetBall();
    this.resetScore();
    gameState$.next(GAME_STATE.pause);
  }

  resetPlayerPositions(): void {
    this.player1.x = GameConfig.screen.padding;
    this.player2.x = GameConfig.screen.width - GameConfig.screen.padding;
    this.player1.y = this.player2.y = this.app.view.height / 2;
  }

  resetCountdown(offset = 0): void {
    this.countDownStartTime = Date.now() + offset;
    this.countDownTime = 0.0;
    this.countDown.visible = true;
  }

  calcScore(): number {
    const scoreIdx = getPlayerIndexAfterScore(this.ball);
    this.score[scoreIdx]++;
    this.scoreText.text = this.getScoreText();
    return scoreIdx;
  }

  getScoreText(): string {
    return `${this.score[0]}:${this.score[1]}`;
  }

  swapPlayersSides(): void {
    const copyX = this.player1.x;
    this.player1.x = this.player2.x;
    this.player2.x = copyX;
    this.initPlayer1Hitarea();
  }

  gameLoop(delta: number): void {
    const stateFn = this.getStateFn(gameState$.getValue());
    if (stateFn) {
      stateFn(delta);
    }
  }

  // Getter & setter
  getBallState(): NewBallState {
    const { x, y, vx, vy } = this.ball;
    return { x, y, vx, vy };
  }

  setBallState(state: NewBallState): void {
    for (const [key, value] of Object.entries(state)) {
      this.ball[key] = value;
    }
  }

  getPlayer1State(): NewPlayerState {
    return { y: this.player1.y };
  }

  setPlayer2State({ y }: NewPlayerState): void {
    this.player2.y = y;
  }

  setScore(score: Score): void {
    this.score = score;
    this.scoreText.text = this.getScoreText();
  }

  getScore(): Score {
    return this.score;
  }

  getStateFn(state: GAME_STATE): GameStateFn | undefined {
    for (const [key, value] of Object.entries(this.GAME_STATE_FN_MAPPING)) {
      if (+key === state) {
        return value;
      }
    }
  }

  // setState(state: GAME_STATE): void {
  //   const newState = this.GAME_STATE_FN_MAPPING[state];
  //   // this.state = newState; // can be undefined
  //   gameState$.next(newState);
  // }

  // Destruction
  destroy(): void {
    console.log('Cleaning up!');
    this.app.destroy();
    this.keyObject.unsubscribe();
    Game.instance = undefined;
  }
}
