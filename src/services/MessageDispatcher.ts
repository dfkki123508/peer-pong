import { Message, MESSAGE_EVENTS } from '../types/types';

type EventCallbackType = (msg: Message) => unknown;

class MessageDispatcher {
  private callbacks = new Map<MESSAGE_EVENTS, EventCallbackType>();

  registerCallback(event: MESSAGE_EVENTS, cb: EventCallbackType): void {
    this.callbacks.set(event, cb);
  }

  deleteCallback(event: MESSAGE_EVENTS): boolean {
    return this.callbacks.delete(event);
  }

  dispatch(msg: Message): unknown {
    try {
      const event = msg['event'];
      const cb = this.callbacks.get(event);
      if (cb) return cb(msg);
    } catch (err) {
      console.error(err);
    } finally {
      return msg;
    }
  }
}

export default MessageDispatcher;
