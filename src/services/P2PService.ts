import { ThemeProvider } from '@material-ui/styles';
import Peer from 'peerjs';
import Game from '../controllers/Game';
import { GenericMessage } from '../types/types';
import { getHandler } from '../util/MessageHandler/MessageHandlerHelpers';
import PingMessageHandler from '../util/MessageHandler/PingMessageHandler';

type Callback = (...args: any[]) => void;
type Event =
  | 'open'
  | 'connection'
  | 'disconnected'
  | 'close'
  | 'error'
  | 'conn-open'
  | 'conn-data'
  | 'conn-close'
  | 'conn-error';

export default class P2PService {
  private static instance: P2PService;
  me: Peer;
  callbackMap: Record<Event, Callback[]> = {
    open: [],
    connection: [],
    disconnected: [],
    close: [],
    error: [],
    'conn-open': [],
    'conn-data': [],
    'conn-close': [],
    'conn-error': [],
  };
  pingInterval: NodeJS.Timeout | undefined;
  master = false;
  avgLatencyWindow = 15;
  lastRtts: Array<number> = [];
  avgLatency = 0;

  private constructor() {
    this.onConnection = this.onConnection.bind(this);
    this.callCallbacks = this.callCallbacks.bind(this);

    this.registerCallback('connection', this.onConnection);
    this.registerCallback('open', () =>
      console.log('Peer id received!', this.me.id),
    );
    this.registerCallback('disconnected', () =>
      console.log('Peer disconnected from signalling server!', this.me),
    );
    this.registerCallback('error', console.log);
    this.registerCallback('conn-open', () => console.log('Connection opened!'));
    this.registerCallback('conn-open', () => {
      console.log('Registering ping interval');
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      this.pingInterval = setInterval(() => {
        const msg = new PingMessageHandler({
          id: 1,
          pingTimestamp: Date.now(),
        });
        this.sendMessage(msg);
      }, 500);
    });
    this.registerCallback('conn-data', (msg) => {
      msg = JSON.parse(msg) as GenericMessage;
      const messageHandler = getHandler(msg);
      if (!messageHandler) {
        console.warn('No message handler found for', msg);
        return;
      }
      messageHandler.onMessage();
    });
    this.registerCallback('conn-close', () => {
      console.log('Connection closed!');
      const game = Game.getInstance();
      game.resetGame();
      game.resetPlayerPositions();
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
    });
    this.registerCallback('conn-error', (err) =>
      console.log('Connection error!', err),
    );

    this.me = new Peer(undefined, { debug: 2 });
    this.me.on('open', (id) => this.callCallbacks('open', id));
    this.me.on('connection', (connection: Peer.DataConnection) =>
      this.callCallbacks('connection', connection),
    );
    this.me.on('disconnected', () => this.callCallbacks('disconnected'));
    this.me.on('close', () => this.callCallbacks('close'));
    this.me.on('error', (err) => this.callCallbacks('error', err));

    console.log('p2pserviceinstance', this);
  }

  static getInstance(): P2PService {
    if (!P2PService.instance) {
      P2PService.instance = new P2PService();
    }
    return P2PService.instance;
  }

  /**
   *
   * @param event peer events or connection events prefixed with conn-, e.g. conn-data
   * @param cb
   * @returns unsubscribe function
   */
  registerCallback(event: Event, cb: Callback): () => void {
    const cbs = this.callbackMap[event];
    cbs.push(cb);
    return () => this.removeCallback(event, cbs.length - 1);
  }

  private removeCallback(event: Event, idx: number): boolean {
    const cbs = this.callbackMap[event];
    if (cbs.length > idx) {
      cbs.splice(idx, 1);
      return true;
    }
    return false;
  }

  callCallbacks(event: Event, ...args: any[]): void {
    const cbs = this.callbackMap[event];
    // console.log('Calling callbacks for', event, cbs);
    for (const cb of cbs) {
      try {
        cb(...args);
      } catch (err) {
        console.error(err);
      }
    }
  }

  addRttValue(rtt: number): void {
    this.lastRtts.push(rtt);
    if (this.lastRtts.length > this.avgLatencyWindow) {
      this.lastRtts.shift();
    }
    const sum = this.lastRtts.reduce((a, b) => a + b, 0);
    this.avgLatency = sum / 2 / this.lastRtts.length || 0;
    // console.log('AVG LATENCY:', this.avgLatency, this.lastRtts.length);
  }

  getNumConnections(): number {
    let num = 0;
    Object.values(
      this.me.connections as { string: Array<Peer.DataConnection> },
    ).forEach((val) => val.forEach(() => num++));
    return num;
  }

  private onConnection(conn: Peer.DataConnection) {
    console.log(
      'New data connection with remote peer!',
      conn,
      this.me.connections,
    );

    conn.on('open', () => this.callCallbacks('conn-open'));
    conn.on('data', (data: string) => this.callCallbacks('conn-data', data));
    conn.on('close', () => this.callCallbacks('conn-close'));
    conn.on('error', (err) => this.callCallbacks('conn-error', err));
  }

  connect(peerId: string): Promise<Peer.DataConnection | never> {
    console.log('Connecting to', peerId);

    return new Promise((resolve, reject) => {
      // Create connection to destination peer specified in the input field
      const conn = this.me.connect(peerId); // conn will be opened some time later
      const rmCb = this.registerCallback('conn-open', () => {
        this.master = true;
        resolve(conn);
        rmCb();
      });
      const rmCb2 = this.registerCallback('error', (err) => {
        reject(err);
        rmCb2();
      });
      this.onConnection(conn);
    });
  }

  disconnect(): void {
    console.log('Closing all connections');
    for (const [remotePeerId, connArr] of Object.entries(
      this.me.connections as { string: Array<Peer.DataConnection> },
    )) {
      for (const connObj of connArr) {
        console.log('Closing', connObj, 'of peer', remotePeerId);
        connObj.close();
      }
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
