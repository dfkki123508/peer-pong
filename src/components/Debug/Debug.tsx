import React from 'react';
import './Debug.scss';
import Game from '../../controllers/Game';
import StartGameMessageHandler from '../../util/MessageHandler/StartGameMessageHandler';
import P2PService from '../../services/P2PService';
import { launchIntoFullscreen, mobileCheck } from '../../util/UiHelpers';

const Debug = () => {
  const p2pService = P2PService.getInstance();
  const [message, setMessage] = React.useState('');
  const [show, setShow] = React.useState(true);
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);
  const game = Game.getInstance();

  React.useEffect(() => {
    const removeCallback = p2pService.registerCallback('open', (peerId) => {
      console.log('me', peerId);
      setMyId(peerId);
    });
    return () => removeCallback();
  }, [p2pService]);

  const onClickStartGame = () => {
    game.startGameTransition();
    const msg = new StartGameMessageHandler(game.getBallState());
    p2pService.sendMessage(msg);
  };

  const onClickSend = () => {
    p2pService.sendMessage(message);
  };

  const onClickResetGame = () => {
    game.resetGame();
  };

  const onClickConnect = async () => {
    if (inputPeerId && inputPeerId != '') {
      try {
        await p2pService.connect(inputPeerId);
        game.swapPlayersSides();
        game.master = true;
        if (mobileCheck()) {
          launchIntoFullscreen();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Invalid peer id:' + inputPeerId);
    }
  };

  const onClickDisconnect = () => {
    p2pService.disconnect();
  };

  const onClickswapPlayersSides = () => {
    game.swapPlayersSides();
  };

  const onClickFullscreen = () => {
    launchIntoFullscreen();
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
            <button onClick={onClickResetGame}>Reset Game</button>
            <button onClick={onClickStartGame}>Start Game</button>
            <button onClick={onClickswapPlayersSides}>Swap sides</button>
            <button onClick={onClickFullscreen}>Fullscreen</button>
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
