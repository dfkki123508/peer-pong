# peer-pong

# TODO:
- make it peer2peer playable like described [here](https://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074)
    * use [peerjs](https://github.com/peers/peerjs/) for connection
        - connect by copying IDs (as a next step use broadcast see below)
            * Better usability in the connection process (minor priority): 
                - direct UDP access is not available for browser apps, so this won't work!! https://stackoverflow.com/questions/40307161/browser-as-udp-dgram-client
                - exchange IDs via websockets (only the IP has to be typed in), browser has to open server possible?
                - register IDs in server
        
- optimise game business logic
- deploy on free static server hosting (e.g. [ZEIT](https://zeit.co/))
