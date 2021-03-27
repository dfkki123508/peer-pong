import React from 'react';
import { Message, MESSAGE_EVENTS } from '../types/types';
import { P2PService, P2PServiceInstance } from './P2PService';
import { switchMap, share, filter, map, tap } from 'rxjs/operators';
import { timer, Subscription, Observable } from 'rxjs';

function sendPing(p2pService: P2PService) {
  const now = Date.now();
  const ping = { event: MESSAGE_EVENTS.ping, data: now };
  p2pService.sendMessage(ping);
  return now;
}

function sendPong(p2pService: P2PService) {
  const pong = { event: MESSAGE_EVENTS.pong, data: Date.now() };
  p2pService.sendMessage(pong);
}

class PeerSyncService {
  p2pService: P2PService;
  ping$: Observable<Message>;
  pong$: Observable<Message>;
  pingSubscription: Subscription;
  public latency$: Observable<number>;

  constructor() {
    this.onPing = this.onPing.bind(this);
    this.onPong = this.onPong.bind(this);

    this.p2pService = P2PServiceInstance;

    // Prepare ping observable
    this.ping$ = this.p2pService
      .getMessage()
      .pipe(filter((d) => d['event'] === MESSAGE_EVENTS.ping));

    // Always listen to ping messages and respond
    this.pingSubscription = this.ping$.subscribe(this.onPing);

    // Start pinging on new connection
    this.p2pService.newConnection.subscribe(() => {
      console.log('Starting ping service!');
      this.startPingService();
    });
  }

  startPingService() {
    // Prepare pong observable
    this.pong$ = this.p2pService
      .getMessage()
      .pipe(filter((d) => d['event'] === MESSAGE_EVENTS.pong));

    // Define Latency observable
    this.latency$ = timer(0, 2000).pipe(
      map(() => sendPing(this.p2pService)),
      switchMap((n) => this.pong$.pipe(map((m) => this.onPong(m, n)))), // TODO: Optimize with timeout
    );
  }

  onPing(msg: Message) {
    console.log('Received ping', msg);
    sendPong(this.p2pService);
  }

  onPong(msg: Message, start: number) {
    console.log('Received pong', msg);
    return Date.now() - start;
  }
}

// export const PeerSyncServiceContext = React.createContext(
//   new PeerSyncService(),
// );

// export const usePeerSyncService = (): PeerSyncService =>
//   React.useContext(PeerSyncServiceContext);
