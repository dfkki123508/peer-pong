import { Point } from 'pixi.js';

export type BallState = {
  x: number;
  y: number;
  sy: number;
  acceleration: Point;
};

export type PlayerState = {
  y: number;
  sy: number;
  dxt: number;
  dyt: number;
  alpha: number;
};

export type GameState = {
  step: GAME_STEP;
  score: [number, number];
  switchPlayer: boolean; // TODO: solve somehow else
};

export enum GAME_STEP {
  'INIT', // implies menu open
  'READY_TO_PLAY', // implies ready_to_play menu open
  'PLAYING', // implies game start
  'FINISHED', // implies result open
}

export enum MESSAGE_EVENTS {
  'message',
  'start_game',
  'move_player',
  'ping',
  'pong',
}

// TODO: probably can be made generic with type for data prop
export type Message<T = unknown> = {
  event: MESSAGE_EVENTS;
  data: T;
};

export type PlayersSide = 'LEFT' | 'RIGHT';
