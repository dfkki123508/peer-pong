import * as PIXI from 'pixi.js';
import anime from 'animejs/lib/anime.es.js';
import { testForAABB } from '../util/Physics';
import GameConfig from '../config/GameConfig';
import { getPlayerIndexAfterScore } from '../util/GameHelpers';
import Keyboard from './Keyboard';
import Background from './Background';
import { Collision, GAME_STATE, NewBallState, Score } from '../types/types';
import {
  newCollisionStore$,
  newPlayerStore$,
  remotePlayerStore$,
} from '../services/GameStore';
import { Subscription } from 'rxjs';
import { Remote } from './Remote';
import { P2PServiceInstance } from '../services/P2PService';
import FinishGameMessageHandler from '../util/MessageHandler/FinishGameMessageHandler';
import StartRoundMessageHandler from '../util/MessageHandler/StartRoundMessageHandler';
import { rand } from '../util/MathHelpers';

type GameStateFn = (delta: number) => void;

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
  state: GameStateFn | undefined;
  keyObject: Keyboard;
  background: Background;
  stopped = false;
  score: Score = [0, 0];
  countDownStartTime = -1;
  countDownTime = -1;

  master = false;
  remoteController: Remote = new Remote(this);
  subs: Array<Subscription> = [];

  GAME_STATE_FN_MAPPING = {
    [GAME_STATE.pause]: undefined,
    [GAME_STATE.play]: this.play,
    [GAME_STATE.start_round]: this.startRoundState,
  };

  private constructor() {
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
    this.player1.tint = 0x123456;
    this.player2 = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.player1.height = this.player2.height = 120;
    this.player1.anchor.set(0.5);
    this.player2.anchor.set(0.5);
    this.player1.x = GameConfig.screen.padding;
    this.player2.x = this.app.view.width - GameConfig.screen.padding;
    this.player1.name = GameConfig.player.local.id;
    this.player2.name = GameConfig.player.remote.id;
    this.subs.push(newPlayerStore$.addObserver(this.player1, 'y'));
    this.subs.push(remotePlayerStore$.addObserver(this.player2, 'y'));
    this.player1.interactive = this.player2.interactive = true;
    this.player1.on('mousemove', (event: PIXI.InteractionEvent) =>
      this.onMouseMove(this.player1, event),
    );
    this.player2.on('mousemove', (event: PIXI.InteractionEvent) =>
      this.onMouseMove(this.player2, event),
    );

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
    this.setState(GAME_STATE.pause);

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
      newPlayerStore$.next({ y: newPosition.y });
      // sprite.y = newPosition.y;
    }
  }

  // Game states
  play(delta: number): void {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    const collision = this.collisionDetection();
    if (collision) {
      this.collisionResponse(collision);
      newCollisionStore$.next(collision);
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
      this.startGameTransition();
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
    this.resetCountdown(offset);
    this.setState(GAME_STATE.start_round);
  }

  startGameTransition(): void {
    this.setState(GAME_STATE.play);
  }

  finishGameTransition(): void {
    this.setState(GAME_STATE.pause);
  }

  scoreTransition(): void {
    this.background.triggerWarp(700);
    const scoreIdx = this.calcScore();
    this.resetBall();
    if (Math.max(...this.score) >= 2) {
      if (this.isLocalPlayerScoreIdx(scoreIdx)) {
        const msg = new FinishGameMessageHandler(this.score);
        P2PServiceInstance.sendMessage(msg);
      }
      this.finishGameTransition();
    } else {
      // TODO: make better check to definitly decide between local and remote player
      if (this.isLocalPlayerScoreIdx(scoreIdx)) {
        const data = { score: this.score, ball: this.getBallState() };
        const msg = new StartRoundMessageHandler(data);
        P2PServiceInstance.sendMessage(msg);
      }
      this.startRoundTransition();
    }
  }

  isLocalPlayerScoreIdx(scoreIdx: number): boolean {
    return (
      (scoreIdx === 0 && this.player1.x < GameConfig.screen.width / 2) ||
      (scoreIdx === 1 && this.player1.x > GameConfig.screen.width / 2)
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
        x: this.player1.x - 15,
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      this.ball.vx *= -GameConfig.ball.speedUp;
      this.ball.vy *= GameConfig.ball.speedUp;
    }
    // Remote player
    else if (collisionObject === this.player2) {
      anime({
        targets: this.player2,
        x: this.player2.x + 15,
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      this.ball.vx *= -GameConfig.ball.speedUp;
      this.ball.vy *= GameConfig.ball.speedUp;
    }
  }

  // Other functions
  resetBall(): void {
    this.ball.x = this.app.view.width / 2;
    this.ball.y = this.app.view.height / 2;
    this.ball.vx = rand(2.0, 5.0) * (Math.random() < 0.5 ? -1 : 1);
    this.ball.vy = rand(-2.0, 2.0);
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
  }

  gameLoop(delta: number): void {
    if (this.state) {
      this.state(delta);
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

  setScore(score: Score): void {
    this.score = score;
    this.scoreText.text = this.getScoreText();
  }

  getScore(): Score {
    return this.score;
  }

  getState(): GAME_STATE | undefined {
    for (const [key, value] of Object.entries(this.GAME_STATE_FN_MAPPING)) {
      if (value === this.state) {
        return +key;
      }
    }
  }

  setState(state: GAME_STATE): void {
    const newState = this.GAME_STATE_FN_MAPPING[state];
    this.state = newState; // can be undefined
  }

  // Destruction
  destroy(): void {
    console.log('Cleaning up!');
    this.remoteController.destroy();
    this.subs.forEach((s) => s.unsubscribe());
    this.app.destroy();
    this.keyObject.unsubscribe();
    Game.instance = undefined;
  }
}
