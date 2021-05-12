import { parse } from '@babel/core';
import { remotePlayerStore$ } from '../services/GameStore';
import { Message, MESSAGE_EVENTS } from '../types/types';

export type GenericMessage<T = unknown> = {
  event: MESSAGE_EVENTS;
  data: T;
  timestampCreated: number;
  timestampReceived?: number;
};

export type MovePlayerMessageDataType = { y: number };
export type BallUpdateMessageDataType = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export abstract class MessageHandler<T = unknown> {
  event!: MESSAGE_EVENTS;
  timestampCreated: number;
  timestampReceived: number | undefined;
  data: T;

  constructor(
    data: MovePlayerMessageDataType | unknown,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    this.timestampCreated = timestampCreated;
    this.timestampReceived = timestampReceived;
    this.data = data as T;
  }

  abstract onMessage(): void;

  static getHandler(
    msg: GenericMessage,
  ): MovePlayerMessageHandler | BallUpdateMessageHandler | undefined {
    switch (msg.event) {
      case MESSAGE_EVENTS.move_player:
        return new MovePlayerMessageHandler(
          msg.data as MovePlayerMessageDataType,
          msg.timestampCreated,
          msg.timestampReceived,
        );
      case MESSAGE_EVENTS.ball_update:
        return new BallUpdateMessageHandler(
          msg.data as BallUpdateMessageDataType,
          msg.timestampCreated,
          msg.timestampReceived,
        );
    }
  }
}

export class MovePlayerMessageHandler extends MessageHandler<MovePlayerMessageDataType> {
  constructor(
    data: MovePlayerMessageDataType,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    super(data, timestampCreated, timestampReceived);
    this.event = MESSAGE_EVENTS.move_player;
  }

  onMessage(): void {
    remotePlayerStore$.next(this.data.y);
  }
}

export class BallUpdateMessageHandler extends MessageHandler<BallUpdateMessageDataType> {
  constructor(
    data: BallUpdateMessageDataType,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    super(data, timestampCreated, timestampReceived);
    this.event = MESSAGE_EVENTS.move_player;
  }

  onMessage(): void {
    console.log('Should process ball update', this.data);
  }
}
