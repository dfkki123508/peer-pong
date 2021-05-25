import { MESSAGE_EVENTS } from '../../types/types';

abstract class AbstractMessageHandler<T = unknown> {
  event!: MESSAGE_EVENTS;
  timestampCreated: number;
  data: T;

  constructor(data: unknown, timestampCreated: number = Date.now()) {
    this.timestampCreated = timestampCreated;
    this.data = data as T;
  }

  abstract onMessage(): void;
}

export { AbstractMessageHandler as default };
