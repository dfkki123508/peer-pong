import { OperatorFunction, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { P2PServiceInstance } from '../services/P2PService';
import {
  BallUpdateMessageDataType,
  FinishGameMessageDataType,
  GenericMessage,
  MovePlayerMessageDataType,
  StartRoundMessageDataType,
} from '../types/types';
import BallUpdateMessageHandler from '../util/MessageHandler/BallUpdateMessageHandler';
import FinishGameMessageHandler from '../util/MessageHandler/FinishGameMessageHandler';
import { getHandler } from '../util/MessageHandler/MessageHandlerHelpers';
import MovePlayerMessageHandler from '../util/MessageHandler/MovePlayerMessageHandler';
import StartRoundMessageHandler from '../util/MessageHandler/StartRoundMessageHandler';
import Game from './Game';

export class Remote {
  p2pService = P2PServiceInstance;
  game: Game;
  subs: Array<Subscription> = [];

  constructor(game: Game) {
    this.game = game;

    // Add all subscriptions to a list
    this.subs.concat([
      // Message receiving
      // On connection
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
          const messageHandler = getHandler(msg);
          if (!messageHandler) {
            console.warn('No message handler found for', msg);
            return;
          }
          messageHandler.onMessage();
        }),
    ]);
  }

  destroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}

export function sendBallUpdate(data: BallUpdateMessageDataType): void {
  console.log('Sending ballupdate after collision');
  if (P2PServiceInstance.getNextOpenConnection()) {
    const message = new BallUpdateMessageHandler(data);
    P2PServiceInstance.sendMessage(message);
  }
}

export function sendMovePlayer(data: MovePlayerMessageDataType): void {
  const message = new MovePlayerMessageHandler(data);
  if (P2PServiceInstance.getNextOpenConnection()) {
    P2PServiceInstance.sendMessage(message);
  }
}

export function sendFinishGame(data: FinishGameMessageDataType): void {
  const msg = new FinishGameMessageHandler(data);
  P2PServiceInstance.sendMessage(msg);
}

export function sendStartRound(data: StartRoundMessageDataType): void {
  const msg = new StartRoundMessageHandler(data);
  P2PServiceInstance.sendMessage(msg);
}
