import Peer from 'peerjs';
import React from 'react';
import { Observable, Subject } from 'rxjs';


// TODO: maybe embed in mobx store to handle shared variables
export class P2PService {
  static numInstances = 0;

  me: Peer;
  messageSubject = new Subject();
  idSubject = new Subject<string>(); // TOOD: replace this HACK: will emit new me ids
  newConnection = new Subject();

  constructor() {
    console.log('Constructing new p2pservice...', P2PService.numInstances);
    P2PService.numInstances++;

    this.onOpen = this.onOpen.bind(this);
    this.onConnection = this.onConnection.bind(this);

    this.me = new Peer(undefined, { debug: 2 });
    this.me.on('open', this.onOpen);
    this.me.on('connection', this.onConnection);
    this.me.on('disconnected', this.onDisconnected);
    this.me.on('close', this.onClose);
    this.me.on('error', this.onError);

    console.log('me:', this.me);
  }

  /**
   * Connects to a remote peer. Disconnects all connections if there are any.
   * @param peerId The id of the remote peer to connect
   * @returns An observable of the data received over this channel
   */
  connect(peerId: string): Observable<unknown> {
    console.log('Connecting to', peerId);

    if (Object.keys(this.me.connections).length > 1) {
      this.disconnect();
    }

    // Create connection to destination peer specified in the input field
    const conn = this.me.connect(peerId, {
      reliable: true,
    });

    console.log('New connection:', conn, this.me);

    this.onData = this.onData.bind(this);

    conn.on('open', () => this.onConnectionOpen(conn));
    conn.on('data', (data) => this.onData(conn, data));
    conn.on('close', () => this.onConnectionClose(conn));

    return this.messageSubject;
  }

  disconnect(conn?: Peer.DataConnection): void {
    if (conn) {
      console.log('[P2PService] Closing connection', conn);
      conn.close();
    } else {
      console.log('Closing all connections');
      Object.keys(this.me.connections).forEach((key) => {
        const c = this.me.connections[key];
        c.close();
      });
    }
  }

  getMessage(): Subject<unknown> {
    return this.messageSubject;
  }

  sendMessage(msg: string | unknown, conn?: Peer.DataConnection): void {
    if (this.me.disconnected || this.me.destroyed) {
      throw new Error('Peer not connected!');
    }

    if (!conn) {
      if (Object.keys(this.me.connections).length < 1) {
        throw new Error('No open connection!');
      }
      conn = (Object.values(
        this.me.connections,
      )[0] as Array<Peer.DataConnection>)[0] as Peer.DataConnection;
    }

    // console.log('Sending msg over connection:', msg, conn);

    if (!(typeof msg === 'string' || msg instanceof String)) {
      msg = JSON.stringify(msg);
    }

    conn.send(msg);
  }

  private onOpen(id: string) {
    console.log('Opened peer.', id, this.me);
    this.idSubject.next(id);
  }

  private onConnection(conn: Peer.DataConnection) {
    console.log('New data connection with remote peer!', conn);
    console.log('THIS', this);
    conn.on('data', (data: unknown) => this.onData(conn, data));
    conn.on('close', () => this.onConnectionClose(conn));
    this.newConnection.next();
  }

  private onDisconnected() {
    console.log(
      '[P2PService] Peer disconnected from signalling server. Reconnecting...',
    );

    this.me.reconnect();
  }

  private onClose() {
    console.log('[P2PService] Peer destroyed');
  }

  private onError(err: unknown) {
    console.log(err);
  }

  private onConnectionClose(conn: Peer.DataConnection) {
    console.log('[P2PService] Connection closed', conn);
  }

  private onConnectionOpen(conn: Peer.DataConnection) {
    console.log('[P2PService] Connected to: ', conn);
  }

  private onData(conn: Peer.DataConnection, data: unknown) {
    console.log('[P2PService] Received data: ', conn, data);
    this.messageSubject.next(data);
  }
}

export const P2PServiceContext = React.createContext(new P2PService());

export const useP2PService = (): P2PService =>
  React.useContext(P2PServiceContext);
