import * as PIXI from 'pixi.js';
import anime from 'animejs/lib/anime.es.js';
import { testForAABB } from '../util/Physics';
import GameConfig from '../config/GameConfig';
import { getPlayerIndexAfterScore } from '../util/GameHelpers';
import Keyboard from './Keyboard';
import Background, { background } from './Background';

type GameStateFn = (delta: number) => void;

type Ball = PIXI.Sprite & {
  vx: number;
  vy: number;
};

type Collision = PIXI.Sprite | 'top' | 'bottom' | 'left' | 'right';

export default class Sketch {
  app: PIXI.Application;
  player1: PIXI.Sprite;
  player2: PIXI.Sprite;
  ball: Ball;
  border: PIXI.Graphics;
  scoreText: PIXI.Text;
  gameState: GameStateFn | undefined;
  keyObject: Keyboard;
  background: Background;
  stopped = false;
  score = [0, 0];

  constructor(app: PIXI.Application) {
    this.app = app;

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
    this.player1.y = this.player2.y = this.app.view.height / 2;

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
      `${this.score[0]}:${this.score[1]}`,
      new PIXI.TextStyle({
        align: 'center',
        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
        fontSize: 50,
        fontWeight: '400',
        fill: ['#ffffff'], // gradient
        stroke: '#ffffff',
        strokeThickness: 5,
        letterSpacing: 20,
        dropShadow: true,
        dropShadowColor: '#ccced2',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
      }),
    );
    this.scoreText.x = GameConfig.screen.width / 2;
    this.scoreText.y = GameConfig.screen.height - GameConfig.screen.padding;
    this.scoreText.anchor.set(0.5);

    this.app.stage.addChild(this.scoreText);

    // this.ball
    this.ball = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.ball.anchor.set(0.5);
    this.resetBall();

    this.app.stage.addChild(this.ball);

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
    this.gameState = this.play;

    //Start the game loop
    this.app.ticker.add((delta) => this.gameLoop(delta));

    console.log('player1:', this.player1);
    console.log('player2:', this.player2);
    console.log('ball', this.ball);
    console.log('border', this.border);
  }

  // Interaction
  onMouseMove(sprite: PIXI.Sprite, event: PIXI.InteractionEvent): void {
    const newPosition = event.data.getLocalPosition(sprite.parent);
    if (newPosition.y > 0 && newPosition.y < this.app.view.height) {
      sprite.y = newPosition.y;
    }
  }

  // Game states
  play(delta: number): void {
    // updateBall();

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    const collision = this.collisionDetection();
    if (collision) {
      this.collisionResponse(collision);
    }
  }

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
    if (collisionObject === 'top' || collisionObject === 'bottom') {
      this.ball.vy *= -1;
    } else if (collisionObject === 'left' || collisionObject === 'right') {
      console.log('SCORE');
      this.background.triggerWarp(700);
      const scoreIdx = getPlayerIndexAfterScore(this.ball);
      this.score[scoreIdx]++;
      this.scoreText.text = `${this.score[0]}:${this.score[1]}`;
      this.resetBall();
    } else if (collisionObject === this.player1) {
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
    } else if (collisionObject === this.player2) {
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
    this.ball.vx = 2.2;
    this.ball.vy = 1.1;
  }

  swapPlayersSides(): void {
    const copyX = this.player1.x;
    this.player1.x = this.player2.x;
    this.player2.x = copyX;
  }

  gameLoop(delta: number): void {
    if (this.gameState) {
      this.gameState(delta);
    }
  }

  // TODO
  cleanup(): void {
    console.log('Cleaning up!');
    this.keyObject.unsubscribe();
  }
}
