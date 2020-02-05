# peer-pong

# TODO:
- make it peer2peer playable like described [here](https://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074)
    * use [peerjs](https://github.com/peers/peerjs/) for connection
        - connect by copying IDs (as a next step use broadcast see below)
            * Better usability in the connection process (minor priority): 
                - exchange IDs via websockets (only the IP has to be typed in), browser has to open server possible?
                - register IDs in server
        
- optimise game business logic
- deploy on free static server hosting (e.g. [ZEIT](https://zeit.co/))
- should we use http://molleindustria.github.io/p5.play/


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

- rewrite P2PService
- loading screens (mat.ui: progress)