import { MESSAGE_EVENTS } from '../../types/types';

abstract class AbstractMessageHandler<T = unknown> {
  event!: MESSAGE_EVENTS;
  timestampCreated: number;
  timestampReceived: number | undefined;
  data: T;

  constructor(
    data: unknown,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    this.timestampCreated = timestampCreated;
    this.timestampReceived = timestampReceived;
    this.data = data as T;
  }

  abstract onMessage(): void;
}

export { AbstractMessageHandler as default };
