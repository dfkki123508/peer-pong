# peer-pong

# TODO:
    - make it peer2peer playable like described [here](https://gamedevelopment.tutsplus.com/tutorials/building-a-peer-to-peer-multiplayer-networked-game--gamedev-10074)
        * use [peerjs](https://github.com/peers/peerjs/) for connection
            - connect by copying IDs (as a next step use broadcast see below)
        * Better usability in the connection process (minor priority)
            1. Both broadcast constantly
            2. Both see the other in the list of players to connect with
            3. One clicks (handle case when both click at almost the same time)
            4. The other one is questioned wether he/she wants to play
            5. If yes, game begins
