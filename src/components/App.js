import React, { useState, useEffect } from 'react';
import './App.css';
import P2PService from '../services/P2PService'
import Game from './Game'

function App() {
  const [anotherPeerId, setAnotherPeerId] = useState(''); // '' is the initial state value
  const [messages, setMessages] = useState([]);

  useEffect(() => P2PService.initialize(onDataReceive), []);  // with [] it is only called once ever

  function onClickConnect() {
    console.log('Conecting to: ' + anotherPeerId);
    P2PService.connect(anotherPeerId, onDataReceive);
  }

  function onDataReceive(data) {
    console.log('Data received: ' + data);
    setMessages(messages => messages.concat(data));
  }

  return (
    <div className="App" >
      <header className="header">
        <label>Please specify:</label>
        <input placeholder="Peer id" onInput={e => setAnotherPeerId(e.target.value)} />
        <input type="submit" onClick={onClickConnect} ></input>
        <label>{P2PService.getPeerId()}</label>
        <button onClick={() => P2PService.sendMessage((new Date()).toLocaleTimeString())}>
          Send message
      </button>
      </header>
      <div className="center">
        <aside className="aside aside-1">
          <ul>
            {messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
          </ul>
        </aside>
        <span className="main">
          <Game />
        </span>
        <aside className="aside aside-2">Aside 2</aside>
      </div>
      <footer className="footer">Footer</footer>


    </div>
  );
}

export default App;
