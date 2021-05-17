# peer-pong

# TODO:
- UI: Optimize for mobile
    * remove lag/stop executing tick when player is moved
- deploy on free static server hosting (e.g. [ZEIT](https://zeit.co/))
- IDEAs:
    * also add small (+artsy) video chat
    * Add gravity effects
- rewrite P2PService:
	* using rxjs
    * or try to gRPC over webrtc via implementing the Transport Interface: https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/src/transports/Transport.ts MOST ADVANCED

- loading screens (mat.ui: progress)
- notifications about errors etc.
- Sync game state/network latency:
    * https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
    * https://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074 
        -> interpolate between remote player updates to move the player smoothly
        -> extrapolate/project remote player state assuming it moves consistantly (current movement is pertained)

    * https://medium.com/@qingweilim/how-do-multiplayer-game-sync-their-state-part-2-d746fa303950
    * Calculate lag:
        - Compare send and receive timestamps of messages
    * ideas:
	* use the calculation of a collision with a player from there where the player is local -> remote player simulates collision but receives authoritive update and has to correct the state
	* 
- Put it on itch.io

# Steps
1. Enter connection string of peer -> connect
2. Game counts from 3 to 0 and starts the game at both simultanuously
