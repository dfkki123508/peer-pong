import React from 'react';
import { useP2PService } from '../../services/P2PService';
import './Debug.scss';
import Game from '../../controllers/Game';
import StartGameMessageHandler from '../../util/MessageHandler/StartGameMessageHandler';

const Debug = () => {
  const p2pService = useP2PService();
  const [message, setMessage] = React.useState('');
  const [show, setShow] = React.useState(true);
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);
  const game = Game.getInstance();

  React.useEffect(() => {
    const sub = p2pService.peer$.subscribe((peer) => {
      console.log('me', peer.id);
      setMyId(peer.id);
    });
    return () => sub.unsubscribe();
  }, [p2pService.peer$]);

  const onClickResetRound = () => {};

  const onClickStartGame = () => {
    const msg = new StartGameMessageHandler(game.getBallState());
    p2pService.sendMessage(msg);
    game.startRoundTransition();
  };

  const onClickSend = () => {
    p2pService.sendMessage(message);
  };

  const onClickReset = () => {
    p2pService.disconnect();
  };

  const onClickConnect = () => {
    if (inputPeerId && inputPeerId != '') {
      p2pService.connect(inputPeerId);
      game.swapPlayersSides();
      game.master = true;
    } else {
      alert('Invalid peer id:' + inputPeerId);
    }
  };

  const onClickDisconnect = () => {
    p2pService.disconnect();
  };

  const onClickCopy = () => {
    if (myId) {
      navigator.clipboard.writeText(myId);
    }
  };

  return (
    <div className="upper-right">
      <button className="flex-end" onClick={() => setShow(!show)}>
        Show
      </button>
      {show && (
        <div>
          <div>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button onClick={onClickSend}>Send</button>
            <button onClick={onClickResetRound}>Reset Round</button>
            <button onClick={onClickReset}>Reset</button>
            <button onClick={onClickStartGame}>Start Game</button>
          </div>
          <div>
            Your Id: <span className="code">{myId}</span>{' '}
            <button onClick={onClickCopy}>Copy!</button> and send to Player2 or
          </div>
          <div>
            <label>Enter</label>
            <input
              type="text"
              placeholder="<Player2 id>"
              value={inputPeerId}
              onChange={(event) => setInputPeerId(event.target.value)}
            />
            <button onClick={onClickConnect}>Connect</button>
            <button onClick={onClickDisconnect}>Disconnect</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debug;
