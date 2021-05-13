import { Subject } from 'rxjs';
import Peer from 'peerjs';
import React from 'react';

export class P2PService {
  peer$ = new Subject<Peer>();
  conn$ = new Subject<Subject<string> | null>();
  message$: Subject<string> | undefined;

  me: Peer;

  constructor() {
    this.onConnection = this.onConnection.bind(this);

    this.me = new Peer(undefined, { debug: 2 });
    this.me.on('open', () => this.peer$.next(this.me));
    this.me.on('connection', this.onConnection);
    this.me.on('disconnected', () => this.peer$.error('Disconnected'));
    this.me.on('close', () => this.peer$.complete());
    this.me.on('error', (err) => this.peer$.error(err));
  }

  private onConnection(conn: Peer.DataConnection) {
    console.log('New data connection with remote peer!', conn);

    // TODO: add check to only allow one connection

    this.message$ = new Subject<string>();
    this.conn$.next(this.message$);
    conn.on('error', (err) => console.error(err));
    conn.on('open', () => this.peer$.next(this.me));
    conn.on('data', (data: string) => this.message$.next(data));
    conn.on('close', () => this.message$.complete());
  }

  connect(peerId: string) {
    console.log('Connecting to', peerId);

    if (Object.keys(this.me.connections).length > 1) {
      this.disconnect();
    }

    // Create connection to destination peer specified in the input field
    const conn = this.me.connect(peerId, {
      reliable: true,
    });

    console.log('Conn', conn.open);
    // if (conn.open) {
    this.onConnection(conn);
    // return true;
    // }
    // return false;
  }

  disconnect(conn?: Peer.DataConnection): void {
    if (conn) {
      console.log('[P2PService] Closing connection', conn);
      conn.close();
    } else {
      console.log('Closing all connections');
      Object.keys(this.me.connections).forEach((key) => {
        const c = this.me.connections[key];
        if (c && c.length > 0) {
          console.log('Closing', c[0]);
          c[0].close();
        }
      });
    }
  }

  /**
   * Iterates over all peers and connections in random order and
   * @returns the first open connection
   */
  getNextOpenConnection(): Peer.DataConnection | undefined {
    for (const [remotePeerId, connArr] of Object.entries(
      this.me.connections as { string: Array<Peer.DataConnection> },
    )) {
      for (const connObj of connArr) {
        if (connObj.open) {
          return connObj;
        }
      }
    }
    return;
  }

  sendMessage(msg: string | unknown, conn?: Peer.DataConnection): void {
    if (this.me.disconnected || this.me.destroyed) {
      throw new Error('Peer not connected!');
    }

    // Use first data connection, if none specified
    if (!conn) {
      conn = this.getNextOpenConnection();
    }

    if (!conn) {
      throw new Error('No open connection!');
    }

    // console.log('Sending msg over connection:', msg, conn);

    if (!(typeof msg === 'string' || msg instanceof String)) {
      msg = JSON.stringify(msg);
    }

    try {
      conn.send(msg);
    } catch (err) {
      console.error(err);
      console.log(this.me);
    }
  }
}

export const P2PServiceInstance = new P2PService();
export const P2PServiceContext = React.createContext(P2PServiceInstance);
export const useP2PService = () => React.useContext(P2PServiceContext);
