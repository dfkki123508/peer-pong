import * as PIXI from 'pixi.js';
import GameConfig from '../config/GameConfig';

const width = 2000;
const fov = 20;
const baseSpeed = 0.025;
const starStretch = 5;
const starBaseSize = 0.05;

type Star = { sprite: PIXI.Sprite; z: number; x: number; y: number };

export default class Background {
  app: PIXI.Application;
  stars: Array<Star> = [];
  warpSpeed = 0;
  speed = 0;
  cameraZ = 0;

  constructor(app: PIXI.Application) {
    this.app = app;

    // Get the texture for rope.
    const starTexture = PIXI.Texture.from('src/assets/star.png');

    // Create the stars
    for (let i = 0; i < GameConfig.background.numStars; i++) {
      const star = {
        sprite: new PIXI.Sprite(starTexture),
        z: 0,
        x: 0,
        y: 0,
      };
      star.sprite.width = width;
      star.sprite.height = width;
      star.sprite.anchor.x = 0.5;
      star.sprite.anchor.y = 0.7;
      this.randomizeStar(star, true);
      app.stage.addChild(star.sprite);
      this.stars.push(star);
    }
    app.ticker.add((delta) => this.loop(delta));
  }

  randomizeStar(star: Star, initial?: boolean): void {
    star.z = initial
      ? Math.random() * 2000
      : this.cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
  }

  triggerWarp(duration: number): void {
    this.warpSpeed = 1;
    setTimeout(() => (this.warpSpeed = 0), duration);
  }

  loop(delta: number): void {
    // Simple easing. This should be changed to proper easing function when used for real.
    this.speed += (this.warpSpeed - this.speed) / 20;
    this.cameraZ += delta * 10 * (this.speed + baseSpeed);
    for (let i = 0; i < GameConfig.background.numStars; i++) {
      const star = this.stars[i];
      if (star.z < this.cameraZ) this.randomizeStar(star);

      // Map star 3d position to 2d with really simple projection
      const z = star.z - this.cameraZ;
      star.sprite.x =
        star.x * (fov / z) * this.app.renderer.screen.width +
        this.app.renderer.screen.width / 2;
      star.sprite.y =
        star.y * (fov / z) * this.app.renderer.screen.width +
        this.app.renderer.screen.height / 2;

      // Calculate star scale & rotation.
      const dxCenter = star.sprite.x - this.app.renderer.screen.width / 2;
      const dyCenter = star.sprite.y - this.app.renderer.screen.height / 2;
      const distanceCenter = Math.sqrt(
        dxCenter * dxCenter + dyCenter * dyCenter,
      );
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      star.sprite.scale.x = distanceScale * starBaseSize;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
      star.sprite.scale.y =
        distanceScale * starBaseSize +
        (distanceScale * this.speed * starStretch * distanceCenter) /
          this.app.renderer.screen.width;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
  }
}
