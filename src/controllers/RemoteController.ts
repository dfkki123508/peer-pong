import { OperatorFunction, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { newPlayerStore$ } from '../services/GameStore';
import { P2PServiceInstance } from '../services/P2PService';
import {
  GenericMessage,
  MessageHandler,
  MovePlayerMessageHandler,
} from '../util/MessageHandler';

export class RemoteController {
  private static instance: RemoteController;
  private p2pService = P2PServiceInstance;

  subs: Array<Subscription> = [];

  // Metrics
  avgDelay = 0;

  private constructor() {
    // Message receiving
    // On connection
    this.subs.push(
      this.p2pService.conn$
        .pipe(
          filter((o) => !!o) as OperatorFunction<
            Subject<string> | null,
            Subject<string>
          >,
          switchMap((messageObservable) => {
            console.log('New connection!');
            return messageObservable.asObservable();
          }),
          map((m) => JSON.parse(m) as GenericMessage),
        )
        .subscribe((msg) => {
          msg.timestampReceived = Date.now();
          const delay = msg.timestampReceived - msg.timestampCreated;
          const messageHandler = MessageHandler.getHandler(msg);
          if (!messageHandler) {
            console.warn('No message handler found for', msg);
            return;
          }
          messageHandler.onMessage();
        }),
    );

    // Message sending
    this.subs.push(
      newPlayerStore$.subscribe((v) => {
        const message = new MovePlayerMessageHandler({ y: v });
        // console.log('Sending message to remote', message);
        try {
          this.p2pService.sendMessage(message);
        } catch (err) {
          console.error(err);
        }
      }),
    );
  }

  static getInstance(): RemoteController {
    if (!RemoteController.instance) {
      RemoteController.instance = new RemoteController();
    }
    return RemoteController.instance;
  }

  destroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
