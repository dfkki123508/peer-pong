import Peer from 'peerjs';


class P2PService {

    static peer;
    static conn;
    static lastPeerId = null;

    static getPeerId() {
        if (P2PService.peer) {
            return P2PService.peer.id;
        }
        return "null";
    }

    static initialize(onDataCallback) {
        // Create own peer object with connection to shared PeerJS server
        P2PService.peer = new Peer(null, { debug: 2 });

        P2PService.peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (P2PService.peer.id === null) {
                console.log('Received null id from peer open');
                P2PService.peer.id = P2PService.lastPeerId;
            } else {
                P2PService.lastPeerId = P2PService.peer.id;
            }

            console.log('ID: ' + P2PService.peer.id);
        });

        P2PService.peer.on('connection', function (c) {
            // Allow only a single connection
            if (P2PService.conn) {
                c.on('open', function () {
                    c.send("Already connected to another client");
                    setTimeout(function () { c.close(); }, 500);
                });
                return;
            }

            P2PService.conn = c;
            console.log("Connected to: " + P2PService.conn.peer);

            P2PService.conn.on('data', onDataCallback);
            
            P2PService.conn.on('close', function () {
                P2PService.conn = null;
                // start(true);     // where is this function from?
            });
        });
        P2PService.peer.on('disconnected', function () {
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            P2PService.peer.id = P2PService.lastPeerId;
            P2PService.peer._lastServerId = P2PService.lastPeerId;
            P2PService.peer.reconnect();
        });

        // TODO: handle does cases, e.g. notifications
        P2PService.peer.on('close', function () {
            P2PService.conn = null;
            console.log('Connection destroyed');
        });
        P2PService.peer.on('error', function (err) {
            console.log(err);
        });
    };


    static connect(anotherPeerId, onDataCallback) {
        console.log('Connecting to ' + anotherPeerId);

        // Close old connection
        if (P2PService.conn) {
            P2PService.conn.close();
        }

        // Create connection to destination peer specified in the input field
        P2PService.conn = P2PService.peer.connect(anotherPeerId, { reliable: true });

        P2PService.conn.on('open', function () {
            console.log("Connected to: " + P2PService.conn.peer);
            P2PService.conn.send('hello! from ' + P2PService.peer.id);
        });

        P2PService.conn.on('data', onDataCallback); // set again, because it was overridden

        P2PService.conn.on('close', function () {
            console.log('Connection closed');
        });
    };

    static sendMessage(msg) {
        if (P2PService.conn.open) {
            P2PService.conn.send(msg);
            console.log("Sent: " + msg);
        }
    };


}

export default P2PService;