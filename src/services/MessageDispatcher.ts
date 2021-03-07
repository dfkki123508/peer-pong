import { MESSAGE_EVENTS } from '../types/types';

type EventCallbackType = (msg: string) => unknown;

class MessageDispatcher {
  private callbacks = new Map<MESSAGE_EVENTS, EventCallbackType>();

  registerCallback(event: MESSAGE_EVENTS, cb: EventCallbackType): void {
    this.callbacks.set(event, cb);
  }

  deleteCallback(event: MESSAGE_EVENTS): boolean {
    return this.callbacks.delete(event);
  }

  dispatch(msg: string): unknown {
    try {
      const msgObj = JSON.parse(msg);
      const event = msgObj['event'];
      const cb = this.callbacks.get(event);
      return cb(msg);
    } catch (err) {
      console.error(err);
      return msg;
    }
  }
}

export default MessageDispatcher;
