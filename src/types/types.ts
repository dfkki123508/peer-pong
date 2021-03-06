import { Point } from 'pixi.js';

export type BallState = {
  x: number;
  y: number;
  sy: number;
  acceleration: Point;
};

export type PlayerState = {
  x: number;
  y: number;
  sy: number;
  dxt: number;
  dyt: number;
  alpha: number;
};

export type GameState = {
  started: boolean;
  score: [number, number];
  switchPlayer: boolean;
};
