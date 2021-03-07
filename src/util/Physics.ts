// Test For Hit

import { Console } from 'node:console';
import { Point } from 'pixi.js';
import GameConfig from '../config/GameConfig';
import { BallState } from '../types/types';
import { multScalar, reflectVector, rotate } from './VectorOperations';

// A basic AABB check between two different squares
export function testForAABB(
  object1: PIXI.Container,
  object2: PIXI.Container,
): boolean {
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y
  );
}

type SIDES = 'top' | 'bottom' | 'left' | 'right';

export function reflectWithin(
  inner: PIXI.Container,
  outer: PIXI.Container,
  sides: Array<SIDES>,
  innerMovingVector: PIXI.Point,
): PIXI.Point {
  const bounds1 = inner.getBounds();
  const bounds2 = outer.getBounds();

  for (const side of sides) {
    switch (side) {
      case 'top':
        if (bounds1.y < bounds2.y && innerMovingVector.y < 0) {
          return reflectVector(new Point(0, 1), innerMovingVector);
        }
        continue;
      case 'bottom':
        if (
          bounds1.y + bounds1.height > bounds2.y + bounds2.height &&
          innerMovingVector.y > 0
        ) {
          return reflectVector(new Point(0, 1), innerMovingVector);
        }
        continue;
      case 'left':
        if (bounds1.x < bounds2.x && innerMovingVector.x < 0) {
          return reflectVector(new Point(1, 0), innerMovingVector);
        }
        continue;
      case 'right':
        if (
          bounds1.x + bounds1.width > bounds2.x + bounds2.width &&
          innerMovingVector.x > 0
        ) {
          return reflectVector(new Point(1, 0), innerMovingVector);
        }
        continue;
    }
  }

  return innerMovingVector;
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const collissionResponse = (vec: PIXI.Point, angularInfcluence = 0) => {
  let newVec = reflectVector(new Point(1, 0), vec); // reflect by normal
  newVec = multScalar(newVec, 1.5); // Speed up
  const alpha = (angularInfcluence * Math.PI) / 3;
  return rotate(newVec, alpha);
};

function checkIfBallMovingTowardsPlayer(
  ballState: BallState,
  player: PIXI.Sprite,
): boolean {
  return (
    (player.x > GameConfig.screen.width / 2 && // right
      ballState.acceleration.x > 0) ||
    (player.x < GameConfig.screen.width / 2 && // left
      ballState.acceleration.x < 0)
  );
}

export function ballUpdate(
  prevBallState: BallState,
  delta: number,
  p1: PIXI.Sprite,
  p2: PIXI.Sprite,
  ball: PIXI.Sprite,
  border: PIXI.Graphics,
): BallState {
  const newState = Object.assign({}, prevBallState);

  if (testForAABB(ball, p1) && checkIfBallMovingTowardsPlayer(newState, p1)) {
    console.log('Collision');
    const angularInfcluence = (ball.y - p1.y) / (p1.height / 2); // 1...-1 depending on ball impact at the player
    newState.acceleration = collissionResponse(
      newState.acceleration,
      angularInfcluence,
    );
  } else if (
    testForAABB(ball, p2) &&
    checkIfBallMovingTowardsPlayer(newState, p2)
  ) {
    console.log('Collision');
    const angularInfcluence = (ball.y - p2.y) / (p2.height / 2); // 1...-1 depending on ball impact at the player
    newState.acceleration = collissionResponse(
      newState.acceleration,
      angularInfcluence,
    );
  }

  const acceleration = reflectWithin(
    ball,
    border,
    ['top', 'bottom'],
    newState.acceleration,
  );
  newState.x += acceleration.x * delta;
  newState.y += acceleration.y * delta;
  newState.acceleration = acceleration;
  return newState;
}
