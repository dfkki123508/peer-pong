import Peer from 'peerjs';


class P2PService {

    static peer = null;
    static conn = null;
    static lastPeerId = null;

    static getPeerId() {
        if (P2PService.peer) {
            return P2PService.peer.id;
        }
        return 'null';
    }

    static initialize(onOpen, onDataCallback, onConnectCallback, onCloseCallback) {

        if (P2PService.peer !== null) return;

        // Create own peer object with connection to shared PeerJS server
        P2PService.peer = new Peer(null, { debug: 2 });

        P2PService.peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (P2PService.peer.id === null) {
                console.log('[P2PService] Received null id from peer open');
                P2PService.peer.id = P2PService.lastPeerId;
            } else {
                P2PService.lastPeerId = P2PService.peer.id;
            }

            console.log('[P2PService] ID: ' + P2PService.peer.id);
            onOpen(P2PService.peer.id);
        });

        P2PService.peer.on('connection', function (c) {
            // Allow only a single connection
            if (P2PService.conn) {
                c.on('open', function () {
                    c.send('Already connected to another client');
                    setTimeout(function () { c.close(); }, 500);
                });
                return;
            }

            P2PService.conn = c;
            console.log('[P2PService] Connected to: ' + P2PService.conn.peer);
            onConnectCallback();

            P2PService.conn.on('data', function (data) {
                console.log('[P2PService] Received data: ', data);
                onDataCallback(data);
            });

            P2PService.conn.on('close', function () {
                console.log('[P2PService] Connection closed');
                P2PService.conn = null;
                // start(true);     // where is this function from?
                onCloseCallback();
            });
        });
        P2PService.peer.on('disconnected', function () {
            console.log('[P2PService] Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            P2PService.peer.id = P2PService.lastPeerId;
            P2PService.peer._lastServerId = P2PService.lastPeerId;
            P2PService.peer.reconnect();
        });

        // TODO: handle does cases, e.g. notifications
        P2PService.peer.on('close', function () {
            P2PService.conn = null;
            console.log('[P2PService] Connection destroyed');
        });
        P2PService.peer.on('error', function (err) {
            console.log(err);
        });
    };


    static connect(anotherPeerId, onDataCallback, onConnectCallback, onCloseCallback) {
        console.log('[P2PService] Connecting to ' + anotherPeerId);

        // Close old connection
        if (P2PService.conn) {
            P2PService.conn.close();
        }

        // Create connection to destination peer specified in the input field
        P2PService.conn = P2PService.peer.connect(anotherPeerId, { reliable: true });

        P2PService.conn.on('open', function () {
            console.log('[P2PService] Connected to: ' + P2PService.conn.peer);
            onConnectCallback();
        });

        P2PService.conn.on('data', function (data) {
            console.log('[P2PService] Received data: ', data);
            onDataCallback(data)
        }); // set again, because it was overridden

        P2PService.conn.on('close', function () {
            console.log('[P2PService] Connection closed');
            onCloseCallback();
        });
    };

    static disconnect() {
        console.log('[P2PService] Closing channel');
        if (P2PService.conn) {
            P2PService.conn.close();
        }

        P2PService.conn = null;
    }

    static sendMessage(msg) {
        if (P2PService.conn.open) {

            // only transfer strings
            if (!(typeof msg === 'string' || msg instanceof String)) {
                msg = JSON.stringify(msg);
            }

            P2PService.conn.send(msg);
            console.log('[P2PService] Sent: ' + msg);
        } else {
            console.log('[P2PService] Error: Connection not open', P2PService.conn);
        }
    };


}

export default P2PService;