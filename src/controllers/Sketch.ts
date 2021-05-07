import * as PIXI from 'pixi.js';
import anime from 'animejs/lib/anime.es.js';
import { testForAABB } from '../util/Physics';

type GameStateFn = (delta: number) => void;

type Ball = PIXI.Sprite & {
  vx: number;
  vy: number;
};

export const sketch = function (app: PIXI.Application): void {
  let player1: PIXI.Sprite,
    player2: PIXI.Sprite,
    ball: Ball,
    border: PIXI.Graphics;
  let gameState: GameStateFn | undefined;
  // let prevGameState: GameStateFn | undefined;
  let keyObject: Keyboard;
  let stopped = false;

  function setup() {
    // players
    player1 = new PIXI.Sprite(PIXI.Texture.WHITE);
    player2 = new PIXI.Sprite(PIXI.Texture.WHITE);
    player1.height = player2.height = 120;
    player1.anchor.set(0.5);
    player2.anchor.set(0.5);
    player1.x = 20;
    player2.x = app.view.width - 20;
    player1.y = player2.y = app.view.height / 2;

    player1.interactive = player2.interactive = true;
    player1.on('mousemove', onMouseMove);
    player2.on('mousemove', onMouseMove);

    app.stage.addChild(player1, player2);

    // ball
    ball = new PIXI.Sprite(PIXI.Texture.WHITE);
    ball.anchor.set(0.5);
    resetBall();

    app.stage.addChild(ball);

    // border
    border = new PIXI.Graphics();
    border.lineStyle(1, 0xfeeb77, 1);
    border.drawRect(20, 20, app.view.width - 20 * 2, app.view.height - 20 * 2);
    border.endFill();

    app.stage.addChild(border);

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
    const speedUpFactor = 1.5;
    if (collisionObject === 'top' || collisionObject === 'bottom') {
      ball.vy *= -1;
    } else if (collisionObject === 'left' || collisionObject === 'right') {
      console.log('SCORE');
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

      ball.vx *= -speedUpFactor;
      ball.vy *= speedUpFactor;
    } else if (collisionObject === player2) {
      anime({
        targets: player2,
        x: player2.x + 15,
        round: 1,
        direction: 'reverse',
        duration: 200,
        easing: 'linear',
      });

      ball.vx *= -speedUpFactor;
      ball.vy *= speedUpFactor;
    }
  }

  function resetBall() {
    ball.x = app.view.width / 2;
    ball.y = app.view.height / 2;
    ball.vx = 2.2;
    ball.vy = 1.1;
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

class Keyboard {
  value: string;
  isDown: boolean;
  isUp: boolean;
  press: (() => void) | undefined;
  release: (() => void) | undefined;

  constructor(value: string) {
    this.value = value;
    this.isDown = false;
    this.isUp = true;
    window.addEventListener('keydown', this.downHandler.bind(this));
    window.addEventListener('keyup', this.upHandler.bind(this));
  }

  downHandler(event: KeyboardEvent) {
    if (event.key === this.value) {
      if (this.isUp && this.press) this.press();
      this.isDown = true;
      this.isUp = false;
      event.preventDefault();
    }
  }

  upHandler(event: KeyboardEvent) {
    if (event.key === this.value) {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
      event.preventDefault();
    }
  }

  unsubscribe() {
    window.removeEventListener('keydown', this.downHandler);
    window.removeEventListener('keyup', this.upHandler);
  }
}

function background(app) {
  // Get the texture for rope.
  const starTexture = PIXI.Texture.from('src/assets/star.png');

  const scale = 0.01;

  const starAmount = 1000;
  let cameraZ = 0;
  const fov = 20;
  const baseSpeed = 0.025;
  let speed = 0;
  let warpSpeed = 0;
  const starStretch = 5;
  const starBaseSize = 0.05;

  // Create the stars
  const stars = [];
  for (let i = 0; i < starAmount; i++) {
    const star = {
      sprite: new PIXI.Sprite(starTexture),
      z: 0,
      x: 0,
      y: 0,
    };
    star.sprite.scale.x = scale;
    star.sprite.scale.y = scale;
    star.sprite.anchor.x = 0.5;
    star.sprite.anchor.y = 0.7;
    randomizeStar(star, true);
    app.stage.addChild(star.sprite);
    stars.push(star);
  }

  function randomizeStar(star, initial) {
    star.z = initial
      ? Math.random() * 2000
      : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
  }

  // Change flight speed every 5 seconds
  setInterval(() => {
    warpSpeed = warpSpeed > 0 ? 0 : 1;
  }, 5000);

  // Listen for animate update
  app.ticker.add((delta) => {
    // Simple easing. This should be changed to proper easing function when used for real.
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (let i = 0; i < starAmount; i++) {
      const star = stars[i];
      if (star.z < cameraZ) randomizeStar(star);

      // Map star 3d position to 2d with really simple projection
      const z = star.z - cameraZ;
      star.sprite.x =
        star.x * (fov / z) * app.renderer.screen.width +
        app.renderer.screen.width / 2;
      star.sprite.y =
        star.y * (fov / z) * app.renderer.screen.width +
        app.renderer.screen.height / 2;

      // Calculate star scale & rotation.
      const dxCenter = star.sprite.x - app.renderer.screen.width / 2;
      const dyCenter = star.sprite.y - app.renderer.screen.height / 2;
      const distanceCenter = Math.sqrt(
        dxCenter * dxCenter + dyCenter * dyCenter,
      );
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      star.sprite.scale.x = distanceScale * starBaseSize;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
      star.sprite.scale.y =
        distanceScale * starBaseSize +
        (distanceScale * speed * starStretch * distanceCenter) /
          app.renderer.screen.width;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
  });
}
