import { observable, decorate } from 'mobx';

class AppStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.myPeerId = null;
    this.appState = 'GameInvite';
  }

  goToSettings() {
    this.appState = 'Settings';
  }

  goToGame() {
    this.appState = 'Game';
  }

  goToError() {
    this.appState = 'Error';
  }

}

decorate(AppStore, {
  myPeerId: observable,
  appState: observable,
});

//  myPeerId: null,
//       master: false,  // the master is the peer who clicks connect and receives the accept
//       messages: [],
//       showGameInviteModal: false,
//       showGameSettingsModal: true,
//       connectionStatus: {
//         peerId: null,
//         connected: false,
//       },
//       gameStatus: {
//         localVSP2P: 0,
//         winningScore: 3,
//         bestOfRounds: 3,
//         accepted: null  // null: no reply, false: rejected
//       },
//       proposedGameStatus: null  // intermediary store

export default AppStore;
