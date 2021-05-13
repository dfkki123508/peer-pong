import * as PIXI from 'pixi.js';
import { OperatorFunction, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import GameConfig from '../config/GameConfig';
import { newCollisionStore$, newPlayerStore$ } from '../services/GameStore';
import { P2PServiceInstance } from '../services/P2PService';
import { GenericMessage } from '../types/types';
import AbstractMessageHandler from '../util/MessageHandler/AbstractMessageHandler';
import BallUpdateMessageHandler from '../util/MessageHandler/BallUpdateMessageHandler';
import MovePlayerMessageHandler from '../util/MessageHandler/MovePlayerMessageHandler';

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
          msg.timestampReceived = Date.now();
          // const delay = msg.timestampReceived - msg.timestampCreated;
          const messageHandler = AbstractMessageHandler.getHandler(msg);
          if (!messageHandler) {
            console.warn('No message handler found for', msg);
            return;
          }
          messageHandler.onMessage();
        }),
      // Message sending
      newPlayerStore$.subscribe((v) => {
        const message = new MovePlayerMessageHandler(v);
        if (this.p2pService.getNextOpenConnection()) {
          // console.log('Sending message to remote', message);
          try {
            this.p2pService.sendMessage(message);
          } catch (err) {
            console.error(err);
          }
        }
      }),
      newCollisionStore$
        .pipe(
          filter(
            (v) =>
              v instanceof PIXI.Sprite && v.name === GameConfig.player.local.id,
          ),
        ) // filter for sprites and local player
        .subscribe((v) => {
          console.log('Sending ballupdate after collision', v);
          if (this.p2pService.getNextOpenConnection()) {
            const ballState = this.game.getBallState();
            const message = new BallUpdateMessageHandler(ballState);
            try {
              this.p2pService.sendMessage(message);
            } catch (err) {
              console.error(err);
            }
          }
        }),
    ]);
  }

  destroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
