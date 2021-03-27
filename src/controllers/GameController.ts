import { GameStoreInstance } from '../services/GameStore';
import { P2PServiceInstance } from '../services/P2PService';

class GameController {
  store = GameStoreInstance;
  p2pService = P2PServiceInstance;

  constructor() {
    // this.p2pService.message$.subscribe();
    // this.p2pService.peer$.subscribe()
    // TODO: register subscriptions to remote
    // -> onconnection -> start game, i.e. set to step PLAYING
    // -> ondisconnect -> reset game
    // -> ondata -> process remote data, e.g. move remote player
  }

  tick() {}

  updatePlayer() {}

  score(player: 0 | 1) {
    const state = this.store.getState();
    state.score[player]++;
    this.store.setScore(state.score);
  }
}
