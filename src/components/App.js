import React, { useState, useEffect } from 'react';
import P2PService from '../services/P2PService'
import Game from './Game'
import './App.css';
import SettingsForm from './SettingsForm';
import GameSettingsModal from './GameSettingsModal';
import Messages from '../messages/Messages';
import GameInviteModal from './GameInviteModal';

class App extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      myPeerId: null,
      master: false,  // the master is the peer who clicks connect and receives the accept
      messages: [],
      showGameInviteModal: false,
      showGameSettingsModal: true,
      connectionStatus: {
        peerId: null,
        connected: false,
      },
      gameStatus: {
        localVSP2P: 0,
        winningScore: 3,
        bestOfRounds: 3,
        accepted: null  // null: no reply, false: rejected
      },
      proposedGameStatus: null  // intermediary store
    }

    this.onClickConnect = this.onClickConnect.bind(this);
    this.onCloseCallback = this.onCloseCallback.bind(this);
    this.onConnectCallback = this.onConnectCallback.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onDataReceive = this.onDataReceive.bind(this);
    this.onGameInviteAcceptClicked = this.onGameInviteAcceptClicked.bind(this);
    this.onGameInviteRejectClicked = this.onGameInviteRejectClicked.bind(this);
    this.onInputPeerId = this.onInputPeerId.bind(this);
    this.onStartGameClicked = this.onStartGameClicked.bind(this);
    this.onGameSettingsClose = this.onGameSettingsClose.bind(this);

    P2PService.initialize(this.onOpen, this.onDataReceive, this.onConnectCallback, this.onCloseCallback);
    // TODO: init p2p only if necessary, i.e. chosen by the user
    // useEffect(() => P2PService.initialize(onDataReceive, onConnectCallback, onCloseCallback), []);  // with [] it is only called once ever

  }

  // TBD
  onClickConnect() {
    console.log('Conecting to: ' + this.state.connectionStatus.peerId);
    P2PService.connect(this.state.connectionStatus.peerId, this.onDataReceive, this.onConnectCallback, this.onCloseCallback);
    this.setState({ master: true });
  }

  onOpen(peerId) {
    this.setState({ myPeerId: peerId });
  }

  onConnectCallback() {
    console.log('onConnectCallback called');
    this.setState(prevState => ({
      connectionStatus: {
        ...prevState.connectionStatus,
        connected: true
      }
    }));

    if (this.state.master) {
      const msg = Messages.OP_GAME_INVITE(this.state.myPeerId, this.state.gameStatus);
      P2PService.sendMessage(msg);
    }
  }

  onCloseCallback() {
    console.log('onCloseCallback called');
    this.setState(prevState => ({
      connectionStatus: {
        ...prevState.connectionStatus,
        connected: false
      }
    }));
    console.log(this.state);
  }

  onDataReceive(data) {
    this.setState({ messages: this.state.messages.concat(data) });

    // parse messages
    const dataObj = JSON.parse(data);
    switch (dataObj.op) {
      case 'OP_MOVE_PLAYER':
        break;
      case 'OP_BALL_COLLIDE':
        break;
      case 'OP_GAME_INVITE':
        this.setState(prevState => ({
          showGameInviteModal: true,
          connectionStatus: {
            ...prevState.connectionStatus,
            peerId: dataObj.name
          },
          proposedGameStatus: dataObj.gameStatus
        }));
        break;
      case 'OP_GAME_INVITE_RESPONSE':
        this.setState(prevState => ({
          master: dataObj.yesOrNo,
          showGameSettingsModal: !dataObj.yesOrNo,
          gameStatus: {
            ...prevState.gameStatus,
            accepted: dataObj.yesOrNo
          }
        }));
        // disconnect from peer, i.e. close channel
        if (!dataObj.yesOrNo) {
          P2PService.disconnect();
        }
        break;
      default:
        console.log('Unable to interpret message', data);
    }
    console.log(this.state);
  }

  onGameInviteAcceptClicked() {
    console.log('About to accept game invite...');
    const msg = Messages.OP_GAME_INVITE_RESPONSE(true);
    P2PService.sendMessage(msg)
    this.setState(prevState => ({
      master: false,
      showGameInviteModal: false,
      showGameSettingsModal: false,
      gameStatus: {
        ...prevState.gameStatus,
        accepted: true,
        localVSP2P: 1,
        bestOfRounds: this.state.proposedGameStatus.bestOfRounds,
        winningScore: this.state.proposedGameStatus.winningScore,
      }
    }));
  }

  onGameInviteRejectClicked() {
    console.log('About to reject game invite...');
    const msg = Messages.OP_GAME_INVITE_RESPONSE(false);
    P2PService.sendMessage(msg)
    this.setState({ showGameInviteModal: false });
  }

  sendDummyMessage() {
    const msg = Messages.OP_DUMMY_MESSAGE('Dummy message from ' + this.state.myPeerId);
    P2PService.sendMessage(msg);
  }

  // TBD
  onInputPeerId(event) {
    const peerId = event.target.value;
    this.setState(prevState => ({
      connectionStatus: {
        ...prevState.connectionStatus,
        peerId: peerId
      }
    }));
  }

  onGameSettingsClose() {
    this.setState({ showGameSettingsModal: false });
  }

  onStartGameClicked(props) {
    console.log(this.state);
    console.log('Form state', props);
    this.setState(prevState => ({
      master: true,
      connectionStatus: {
        ...prevState.connectionStatus,
        peerId: props.otherPeerId
      },
      gameStatus: {
        ...prevState.gameStatus,
        bestOfRounds: props.bestOfRounds,
        localVSP2P: props.localVSP2P,
        winningScore: props.winningScore
      }
    }));
    if (props.localVSP2P === 1) {
      P2PService.connect(props.otherPeerId, this.onDataReceive, this.onConnectCallback, this.onCloseCallback);
    }
  }

  render() {
    return (
      <div className="App" >
        <header className="header">
          <label>Please specify:</label>
          <input placeholder="Peer id" onInput={this.onInputPeerId} />
          <input type="submit" onClick={this.onClickConnect} ></input>
          <label>{this.state.myPeerId}</label>
          <button onClick={this.sendDummyMessage}>
            Send message
          </button>
        </header>
        <div className="center">
          <aside className="aside aside-1">
            <ul>
              {this.state.messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
            </ul>
          </aside>
          <span className="main">
            {this.state.showGameInviteModal &&
              <GameInviteModal
                handleClose={this.onGameInviteRejectClicked}
                name={this.state.connectionStatus.peerId}
                onAccept={this.onGameInviteAcceptClicked}
              />
            }
            {this.state.showGameSettingsModal &&
              <GameSettingsModal
                handleClose={this.onGameSettingsClose}
                onStartGameClicked={this.onStartGameClicked}
                peerId={this.state.connectionStatus.peerId}
                myPeerId={this.state.myPeerId}
              />
            }
            {/* <Game /> */}
          </span>
          <aside className="aside aside-2">
            {JSON.stringify(this.state, null, 2)}
          </aside>
        </div>
        <footer className="footer">Footer</footer>


      </div>
    );
  }
}

export default App;
