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
  state: GAME_STATE;
  score: [number, number];
  switchPlayer: boolean; // TODO: solve somehow else
};

export enum GAME_STATE {
  'INIT', // implies menu open
  'READY_TO_PLAY', // implies ready_to_play menu open
  'PLAYING', // implies game start
  'FINISHED', // implies result open
}

export enum MESSAGE_EVENTS {
  'message',
  'start_game',
  'move_player',
}

// TODO: probably can be made generic with type for data prop
export type Message = {
  event: MESSAGE_EVENTS;
  data?: unknown;
};

export type PlayersSide = 'LEFT' | 'RIGHT';
