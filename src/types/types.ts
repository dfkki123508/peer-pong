import { Point } from 'pixi.js';
import { SpringValue } from 'react-spring';

// TODO: make x,y PIXI.Point as well or acceleration and all properties primitive
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
  'finish_game',
}

export enum DEBUG_COMMANDS {
  'toggle_freeze',
}

// TODO: probably can be made generic with type for data prop
export type Message<T = never> = {
  event: MESSAGE_EVENTS;
  data: T;
};

export type PixiApplicationOptions = {
  autoStart?: boolean;
  width?: number;
  height?: number;
  view?: HTMLCanvasElement;
  transparent?: boolean;
  autoDensity?: boolean;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  resolution?: number;
  forceCanvas?: boolean;
  backgroundColor?: number;
  clearBeforeRender?: boolean;
  powerPreference?: string;
  sharedTicker?: boolean;
  sharedLoader?: boolean;
  resizeTo?: Window | HTMLElement;
};

export enum GAME_STATE {
  'play',
  'start_round',
  'pause',
}

export type Collision = PIXI.Sprite | 'top' | 'bottom' | 'left' | 'right';

export type Score = [number, number];

export type NewPlayerState = {
  y: number;
};

export type NewBallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type GenericMessage<T = unknown> = {
  event: MESSAGE_EVENTS;
  data: T;
  timestampCreated: number;
  timestampReceived?: number;
};

export type MovePlayerMessageDataType = NewPlayerState;
export type BallUpdateMessageDataType = NewBallState;
export type StartRoundMessageDataType = {
  score: Score;
  ball: NewBallState;
};
export type StartGameMessageDataType = NewBallState;
export type FinishGameMessageDataType = Score;
