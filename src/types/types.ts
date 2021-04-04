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
  step: GAME_STEP;
  score: [number, number];
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
  'debug_command',
  'ball_update',
  'start_round',
  'reset_round',
}

export enum DEBUG_COMMANDS {
  'toggle_freeze',
}

// TODO: probably can be made generic with type for data prop
export type Message<T = never> = {
  event: MESSAGE_EVENTS;
  data: T;
};
