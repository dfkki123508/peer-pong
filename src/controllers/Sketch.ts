import * as PIXI from 'pixi.js';
import anime from 'animejs/lib/anime.es.js';
import { testForAABB } from '../util/Physics';
import GameConfig from '../config/GameConfig';
import { getPlayerIndexAfterScore } from '../util/GameHelpers';
import Keyboard from './Keyboard';

type GameStateFn = (delta: number) => void;

type Ball = PIXI.Sprite & {
  vx: number;
  vy: number;
};

export const sketch = function (app: PIXI.Application): void {
  let player1: PIXI.Sprite,
    player2: PIXI.Sprite,
    ball: Ball,
    border: PIXI.Graphics,
    scoreText: PIXI.Text;
  let gameState: GameStateFn | undefined;
  let keyObject: Keyboard;
  let stopped = false;
  const score = [0, 0];

  function setup() {
    // border
    border = new PIXI.Graphics();
    border.lineStyle(1, 0xfeeb77, 1);
    border.drawRect(20, 20, app.view.width - 20 * 2, app.view.height - 20 * 2);
    border.endFill();

    app.stage.addChild(border);

    // players
    player1 = new PIXI.Sprite(PIXI.Texture.WHITE);
    player1.tint = 0x123456;
    player2 = new PIXI.Sprite(PIXI.Texture.WHITE);
    player1.height = player2.height = 120;
    player1.anchor.set(0.5);
    player2.anchor.set(0.5);
    player1.x = GameConfig.screen.padding;
    player2.x = app.view.width - GameConfig.screen.padding;
    player1.y = player2.y = app.view.height / 2;

    player1.interactive = player2.interactive = true;
    player1.on('mousemove', onMouseMove);
    player2.on('mousemove', onMouseMove);

    app.stage.addChild(player1, player2);

    // score text
    scoreText = new PIXI.Text(
      `${score[0]}:${score[1]}`,
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
    scoreText.x = GameConfig.screen.width / 2;
    scoreText.y = GameConfig.screen.height - GameConfig.screen.padding;
    scoreText.anchor.set(0.5);

    app.stage.addChild(scoreText);

    // ball
    ball = new PIXI.Sprite(PIXI.Texture.WHITE);
    ball.anchor.set(0.5);
    resetBall();

    app.stage.addChild(ball);

    // Keyboard Interactions
    // Space to suspend/resume game loop
    keyObject = new Keyboard(' ');
    keyObject.release = () => {
      console.log('Suspend/Resume');
      if (stopped) {
        app.start();
        stopped = false;
      } else {
        app.stop();
        stopped = true;
      }
    };

    // set state
    gameState = play;

    //Start the game loop
    app.ticker.add((delta) => gameLoop(delta));

    console.log('Player1:', player1);
    console.log('Player2:', player2);
    console.log('Ball', ball);
    console.log('Border', border);
  }

  // Interaction
  function onMouseMove(this: PIXI.Sprite, event: PIXI.InteractionEvent) {
    const newPosition = event.data.getLocalPosition(this.parent);
    if (newPosition.y > 0 && newPosition.y < app.view.height) {
      this.y = newPosition.y;
    }
  }

  // Game states
  function play(delta: number) {
    // updateBall();

    ball.x += ball.vx;
    ball.y += ball.vy;

    const collision = collisionDetection(ball);
    if (collision) {
      // console.log('Collision at', collision);
      collisionResponse(ball, collision);
    }
  }

  function collisionDetection(ball: Ball) {
    const ballBounds = ball.getBounds();
    const borderBounds = border.getBounds();

    // Check borders
    // Top Border
    if (ballBounds.y < borderBounds.y && ball.vy < 0) {
      return 'top';
    }

    // Bottom Border
    if (
      ballBounds.y + ballBounds.height > borderBounds.y + borderBounds.height &&
      ball.vy > 0
    ) {
      return 'bottom';
    }

    // Left Border
    if (ballBounds.x < borderBounds.y && ball.vx < 0) {
      return 'left';
    }

    // Right Border
    if (
      ballBounds.x + ballBounds.width > borderBounds.x + borderBounds.width &&
      ball.vx > 0
    ) {
      return 'right';
    }

    // Check player1
    if (
      testForAABB(ball, player1) &&
      ((player1.x > app.view.width / 2 && ball.vx > 0) ||
        (player1.x < app.view.width / 2 && ball.vx < 0))
    ) {
      return player1;
    }

    // Check player2
    if (
      testForAABB(ball, player2) &&
      ((player2.x > app.view.width / 2 && ball.vx > 0) ||
        (player2.x < app.view.width / 2 && ball.vx < 0))
    ) {
      return player2;
    }
  }

  function collisionResponse(
    ball: Ball,
    collisionObject: PIXI.Container | string,
  ) {
    if (collisionObject === 'top' || collisionObject === 'bottom') {
      ball.vy *= -1;
    } else if (collisionObject === 'left' || collisionObject === 'right') {
      console.log('SCORE');
      const scoreIdx = getPlayerIndexAfterScore(ball);
      score[scoreIdx]++;
      scoreText.text = `${score[0]}:${score[1]}`;
      resetBall();
    } else if (collisionObject === player1) {
      anime({
        targets: player1,
        x: player1.x - 15,
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      ball.vx *= -GameConfig.ball.speedUp;
      ball.vy *= GameConfig.ball.speedUp;
    } else if (collisionObject === player2) {
      anime({
        targets: player2,
        x: player2.x + 15,
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      ball.vx *= -GameConfig.ball.speedUp;
      ball.vy *= GameConfig.ball.speedUp;
    }
  }

  // Other functions
  function resetBall() {
    ball.x = app.view.width / 2;
    ball.y = app.view.height / 2;
    ball.vx = 2.2;
    ball.vy = 1.1;
  }

  function swapPlayersSides() {
    const copyX = player1.x;
    player1.x = player2.x;
    player2.x = copyX;
  }

  function gameLoop(delta: number) {
    if (gameState) {
      gameState(delta);
    }
  }

  // TODO
  function cleanup() {
    console.log('Cleaning up!');
    keyObject.unsubscribe();
  }

  setup();
};
