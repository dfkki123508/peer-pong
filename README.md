# peer-pong

# TODO:
- UI: Optimize for mobile
    * remove lag/stop executing tick when player is moved
- deploy on free static server hosting (e.g. [ZEIT](https://zeit.co/))
- IDEA: also add small (+artsy) video chat
- rewrite P2PService:
	* using rxjs
    * or try to gRPC over webrtc via implementing the Transport Interface: https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/src/transports/Transport.ts MOST ADVANCED

- loading screens (mat.ui: progress)
- notifications about errors etc.
- Sync game state:
    * https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
    * Calculate lag:
        - Compare send and receive timestamps of messages

# Steps
1. Enter connection string of peer -> connect
2. Game counts from 3 to 0 and starts the game at both simultanuously
