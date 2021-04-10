import { Point } from 'pixi.js';

// Calculate the distance between two given points
export function distanceBetweenTwoPoints(
  p1: PIXI.Sprite | PIXI.Point,
  p2: PIXI.Sprite | PIXI.Point,
): number {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;

  return Math.hypot(a, b);
}

/**
 * r = d - 2 *(d.dot(n))n
 * @param normal normalized vector
 * @param vec another vector
 */
export function reflectVector(normal: PIXI.Point, vec: PIXI.Point): PIXI.Point {
  const dot = normal.x * vec.x + normal.y * vec.y;
  return new Point(vec.x - 2 * dot * normal.x, vec.y - 2 * dot * normal.y);
}

export function addVector(p1: PIXI.Point, p2: PIXI.Point): PIXI.Point {
  p1.x += p2.x;
  p1.y += p2.y;
  return p1;
}

export function addScalar(p: PIXI.Point, n: number): PIXI.Point {
  p.x += n;
  p.y += n;
  return p;
}

export function multScalar(p: PIXI.Point, n: number): PIXI.Point {
  p.x *= n;
  p.y *= n;
  return p;
}

export function divScalar(p: PIXI.Point, n: number): PIXI.Point {
  p.x /= n;
  p.y /= n;
  return p;
}

export function norm(p: PIXI.Point): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function rotate(p: PIXI.Point, alpha: number): PIXI.Point {
  p.x = Math.cos(alpha) * p.x - Math.sin(alpha) * p.y;
  p.y = Math.sin(alpha) * p.x + Math.cos(alpha) * p.y;
  return p;
}
