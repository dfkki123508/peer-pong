import { Point } from 'pixi.js';
import GameConfig from '../config/GameConfig';
import { BallState } from '../types/types';
import {
  addVector,
  divScalar,
  multScalar,
  norm,
  reflectVector,
  rotate,
} from './VectorOperations';

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
  acceleration: PIXI.Point,
): PIXI.Point {
  const bounds1 = inner.getBounds();
  const bounds2 = outer.getBounds();

  for (const side of sides) {
    switch (side) {
      case 'top':
        if (bounds1.y < bounds2.y && acceleration.y < 0) {
          return reflectVector(new Point(0, 1), acceleration);
        }
        continue;
      case 'bottom':
        if (
          bounds1.y + bounds1.height > bounds2.y + bounds2.height &&
          acceleration.y > 0
        ) {
          return reflectVector(new Point(0, 1), acceleration);
        }
        continue;
      case 'left':
        if (bounds1.x < bounds2.x && acceleration.x < 0) {
          return reflectVector(new Point(1, 0), acceleration);
        }
        continue;
      case 'right':
        if (
          bounds1.x + bounds1.width > bounds2.x + bounds2.width &&
          acceleration.x > 0
        ) {
          return reflectVector(new Point(1, 0), acceleration);
        }
        continue;
    }
  }

  return acceleration;
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const collisionResponse = (vec: PIXI.Point, angularInfcluence = 0) => {
  let newVec = reflectVector(new Point(1, 0), vec); // reflect by normal
  newVec = multScalar(newVec, GameConfig.ball.speedUp); // Speed up
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

export function checkIfObjectInCanvas(obj: PIXI.Sprite): boolean {
  return (
    obj.x > 0 &&
    obj.x < GameConfig.screen.width &&
    obj.y > 0 &&
    obj.y < GameConfig.screen.height
  );
}

export function ballUpdate(
  prevBallState: BallState,
  delta: number,
  p1: PIXI.Sprite,
  p2: PIXI.Sprite,
  ball: PIXI.Sprite,
  border: PIXI.Graphics,
): [BallState, boolean, boolean] {
  const newState = Object.assign({}, prevBallState);
  let localPlayerCollision = false;
  let collision = false;

  if (testForAABB(ball, p1) && checkIfBallMovingTowardsPlayer(newState, p1)) {
    // console.log('Collision');
    const angularInfcluence = (ball.y - p1.y) / (p1.height / 2); // 1...-1 depending on ball impact at the player
    newState.acceleration = collisionResponse(
      newState.acceleration,
      angularInfcluence,
    );
    localPlayerCollision = collision = true;
  } else if (
    testForAABB(ball, p2) &&
    checkIfBallMovingTowardsPlayer(newState, p2)
  ) {
    // console.log('Collision');
    const angularInfcluence = (ball.y - p2.y) / (p2.height / 2); // 1...-1 depending on ball impact at the player
    newState.acceleration = collisionResponse(
      newState.acceleration,
      angularInfcluence,
    );
    collision = true;
  }

  // Scale to previous acceleration if it got smaller during collisionResponse calculation
  if (collision) {
    const newAcc = norm(newState.acceleration);
    const prevAcc = norm(prevBallState.acceleration);
    if (newAcc < prevAcc) {
      multScalar(divScalar(newState.acceleration, newAcc), prevAcc);
    }
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
  return [newState, collision, localPlayerCollision];
}

export function lineIntersection(
  p1: PIXI.Point,
  p2: PIXI.Point,
  p3: PIXI.Point,
  p4: PIXI.Point,
): PIXI.Point | null {
  const u =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));

  const x = p3.x + u * (p4.x - p3.x);
  const y = p3.y + u * (p4.y - p4.y);

  if (u < 0 || u > 1.0) return null;
  return new Point(x, y);
}

/**
 * Basically like ray projection
 * @param ballState
 * @param border
 * @returns
 */
export function projectBallMovement(
  ballState: BallState,
  border: PIXI.Graphics,
): Array<PIXI.Point> {
  const intersections = [new Point(ballState.x, ballState.y)];
  const bounds = border.getBounds();
  const prevBallState = {
    ...ballState,
    acceleration: ballState.acceleration.clone(),
  };
  const MAX_IT = 10;
  let borderP1, borderP2;
  let it = 0;

  while (it++ < MAX_IT) {
    const downwards = prevBallState.acceleration.y > 0;

    if (downwards) {
      borderP1 = new Point(bounds.left, bounds.bottom);
      borderP2 = new Point(bounds.right, bounds.bottom);
    } else {
      borderP1 = new Point(bounds.left, bounds.top);
      borderP2 = new Point(bounds.right, bounds.top);
    }

    const ballP1 = new Point(prevBallState.x, prevBallState.y);
    const ballP2 = addVector(
      multScalar(prevBallState.acceleration.clone(), downwards ? -1000 : 1000),
      ballP1,
    );

    // Compute intersection with border
    const intersection = lineIntersection(ballP1, ballP2, borderP1, borderP2);
    if (!intersection) break;
    intersections.push(intersection);

    // Update
    const newAcc = reflectVector(new Point(0, 1), prevBallState.acceleration);
    prevBallState.acceleration = newAcc;
    prevBallState.x = intersection.x;
    prevBallState.y = intersection.y;
  }

  // Last intersection will be hit point at left/right wall
  const rightwards = prevBallState.acceleration.x > 0;
  if (rightwards) {
    borderP1 = new Point(bounds.right, bounds.top);
    borderP2 = new Point(bounds.right, bounds.bottom);
  } else {
    borderP1 = new Point(bounds.left, bounds.top);
    borderP2 = new Point(bounds.left, bounds.bottom);
  }

  const ballP1 = new Point(prevBallState.x, prevBallState.y);
  const ballP2 = addVector(
    multScalar(prevBallState.acceleration.clone(), rightwards ? -1000 : 1000),
    ballP1,
  );

  const intersection = lineIntersection(ballP1, ballP2, borderP1, borderP2);
  if (intersection) intersections.push(intersection);

  console.log('Intersections', intersections);
  return intersections;
}

/**
 *
 * @param ballState Object state with position and acceleration
 * @param border border
 * @returns Points of line segment of obstacle border
 */
export function getNextObstacleBorder(
  ballState: BallState,
  border: PIXI.Graphics,
): [PIXI.Point, PIXI.Point] {
  const bounds = border.getBounds();
  const downwards = ballState.acceleration.y > 0;
  let borderP1, borderP2;

  if (downwards) {
    borderP1 = new Point(bounds.left, bounds.bottom);
    borderP2 = new Point(bounds.right, bounds.bottom);
  } else {
    borderP1 = new Point(bounds.left, bounds.top);
    borderP2 = new Point(bounds.right, bounds.top);
  }
  return [borderP1, borderP2];
}
