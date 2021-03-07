import React from 'react';
import {
  Container,
  render,
  useApp,
  useTick,
  _ReactPixi,
} from '@inlet/react-pixi';
import { Point, Sprite, State, Texture } from 'pixi.js';
import { Sprite as ReactSprite } from '@inlet/react-pixi';
import GameConfig from '../../../config/GameConfig';
import { rand } from '../../../util/Physics';

type Star = {
  x: number;
  y: number;
  z: number;
  u: number;
  v: number;
  scale: { x: number; y: number };
  rotation: number;
};

function randomStar(minx: number, maxx: number, miny: number, maxy: number) {
  return { u: rand(minx, maxx), v: rand(miny, maxy) };
}

function imageToCamera({ u, v, z }: { u: number; v: number; z: number }) {
  return {
    x: (u - GameConfig.screen.width / 2) * z,
    y: (v - GameConfig.screen.height / 2) * z,
  };
}

function cameraToimage({ x, y, z }: { x: number; y: number; z: number }) {
  const u = x / z + GameConfig.screen.width / 2;
  const v = y / z + GameConfig.screen.height / 2;
  return { u, v };
}

function moveCameraAlongZ(z: number, dz: number) {
  return z - dz; // camera moves forward, therefore z of star has to shrink
}

type StarPropsType = {
  x: number;
  y: number;
  scale: _ReactPixi.PointLike;
  rotation: number;
};

function Star({ x, y, scale, rotation }: StarPropsType) {
  return (
    <ReactSprite
      texture={Texture.WHITE}
      anchor={[0.5, 0.7]}
      width={5}
      height={5}
      scale={scale}
      rotation={rotation}
      x={x}
      y={y}
    />
  );
}

const Background = () => {
  const app = useApp();
  const containerRef = React.createRef<PIXI.Container>();
  const starBaseSize = 0.25;
  const cameraZRef = React.useRef(0);
  const baseSpeed = 0.025;
  const speedRef = React.useRef(0);
  // let warpSpeed = 0;
  const starStretch = 5;

  const [state, setState] = React.useState<Array<Star>>(
    [...new Array(GameConfig.background.numStars)].map(() => ({
      ...randomStar(0, GameConfig.screen.width, 0, GameConfig.screen.height),
      x: 0,
      y: 0,
      z: rand(40, 2000),
      scale: { x: 1.0, y: 1.0 },
      rotation: 0,
    })),
  );

  React.useEffect(() => {
    setState((prevState) => {
      const newState = [];
      for (let i = 0; i < GameConfig.background.numStars; i++) {
        const starState = Object.assign({}, prevState[i]);
        const { x, y } = imageToCamera(starState);
        starState.x = x;
        starState.y = y;
        newState.push(starState);
      }
      return newState;
    });
  }, []);

  useTick((delta) => {
    if (delta && containerRef.current) {
      setState((prevState) => {
        const newState = [];
        for (let i = 0; i < GameConfig.background.numStars; i++) {
          const starState = Object.assign({}, prevState[i]);
          let newZ = moveCameraAlongZ(starState.z, baseSpeed * delta);
          if (newZ < cameraZRef.current) {
            newZ = rand(2000, 3000);
          }
          const { u, v } = cameraToimage({
            x: starState.x,
            y: starState.y,
            z: newZ,
          });
          starState.u = u;
          starState.v = v;
          starState.z = newZ;

          // Calculate star scale & rotation.
          const dxCenter = starState.u - app.renderer.screen.width / 2;
          const dyCenter = starState.v - app.renderer.screen.height / 2;
          const distanceCenter = Math.sqrt(
            dxCenter * dxCenter + dyCenter * dyCenter,
          );
          const distanceScale = Math.max(0, (2000 - newZ) / 2000);
          starState.scale.x = distanceScale * starBaseSize;
          // Star is looking towards center so that y axis is towards center.
          // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
          starState.scale.y =
            distanceScale * starBaseSize +
            (distanceScale * speedRef.current * starStretch * distanceCenter) /
              app.renderer.screen.width;
          starState.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;

          newState.push(starState);
        }
        return newState;
      });
    }
  });

  return (
    <Container ref={containerRef}>
      {[...Array(GameConfig.background.numStars)].map((x, i) => (
        <Star
          key={i}
          x={state[i].u}
          y={state[i].v}
          scale={state[i].scale}
          rotation={state[i].rotation}
        />
      ))}
    </Container>
  );
};

export default Background;
