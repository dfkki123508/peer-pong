import React, { useState, useEffect } from 'react';
import P2PService from '../services/P2PService';
import Game from './Game';
import './App.css';
import SettingsForm from './SettingsForm';
import GameSettingsModal from './GameSettingsModal';
import Messages from '../messages/Messages';
import GameInviteModal from './modals/GameInvite/GameInviteModal';
import Settings from './modals/Settings/Settings';
import Error from './modals/Error/Error';
import { useObserver } from 'mobx-react';
import { useAppStore } from '../stores/RootStore';

const App = (props) => {
  const appStore = useAppStore();

  const renderModal = (appState) => {
    console.log(appState);
    switch (appState) {
      case 'GameInvite':
        return <GameInviteModal></GameInviteModal>;
      case 'Settings':
        return <Settings></Settings>;
      case 'Error':
        return <Error></Error>;
      default:
        break;
    }
  };

  return useObserver(() => (
    <div className="App">
      <header className="header">
        <label>Please specify:</label>
        {/* <input placeholder="Peer id" onInput={this.onInputPeerId} /> */}
        {/* <input type="submit" onClick={this.onClickConnect}></input> */}
        {/* <label>{this.state.myPeerId}</label> */}
        {/* <button onClick={this.sendDummyMessage}>Send message</button> */}
      </header>
      <div className="center">
        <aside className="aside aside-1">
          <ul>
            {/* {this.state.messages.map((msg, idx) => ( */}
            {/* <li key={idx}>{msg}</li> */}
            {/* ))} */}
          </ul>
        </aside>
        <span className="main">{/* <Game /> */}</span>
        <aside className="aside aside-2">
          {JSON.stringify(appStore.myPeerId, null, 2)}
        </aside>
      </div>
      <footer className="footer">Footer</footer>
      {renderModal(appStore.appState)}
    </div>
  ));
};

export default App;
