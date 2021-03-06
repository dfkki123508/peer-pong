# peer-pong

# TODO:
- make it peer2peer playable like described [here](https://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074)
    * use [peerjs](https://github.com/peers/peerjs/) for connection
        - connect by copying IDs (as a next step use broadcast see below)
            * Better usability in the connection process (minor priority): 
                - exchange IDs via websockets (only the IP has to be typed in), browser has to open server possible?
                - register IDs in server
                - use QRCodes
- UI: Optimize for mobile

- optimise game business logic
- deploy on free static server hosting (e.g. [ZEIT](https://zeit.co/))
- IDEA: also add small (+artsy) video chat

1. select local or peer2peer
    2. overlay (p2p): 
        - hello name (generated)
        - connect to peer, another one has to accept
        - modus: best of 5 (anymode),
        - colormode (optional)
    OR
    2. overlay (local):
        - 

3. Starting screen: A vs. B -> 3,2,1 Go! And countdown before start, after goal
4. winning/losing message

- rewrite P2PService:
	* maybe use https://github.com/bigstepinc/jsonrpc-bidirectional PRACTICAL?
	* or write a message dispatcher: bind callbacks to json message key: e.g. event
		{
		  "event": "pusher:connection_established",
		  "data": "{\"socket_id\":\"123.456\"}"
		}
        EASY
	or like here https://api.slack.com/events
    * or try to gRPC over webrtc via implementing the Transport Interface: https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/src/transports/Transport.ts MOST ADVANCED

- loading screens (mat.ui: progress)

- Regarding synchronization:
    * https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
    * Calculate lag:
        - Compare send and receive timestamps of messages

# Steps
1. Enter connection string of peer -> connect
2. Game counts from 3 to 0 and starts the game at both simultanuously
