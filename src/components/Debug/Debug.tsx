import React from 'react';
import './Debug.scss';
import Game from '../../controllers/Game';
import QRCode from 'qrcode.react';
import StartGameMessageHandler from '../../util/MessageHandler/StartGameMessageHandler';
import P2PService from '../../services/P2PService';
import { launchIntoFullscreen, mobileCheck } from '../../util/UiHelpers';
import Button from '../Button/Button';

const Debug = () => {
  const p2pService = P2PService.getInstance();
  const [message, setMessage] = React.useState('');
  const [show, setShow] = React.useState(true);
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);
  const [connected, setConnected] = React.useState(false);
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
        setConnected(true);
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
    setConnected(false);
  };

  const onClickswapPlayersSides = () => {
    game.swapPlayersSides();
  };

  const onClickFullscreen = () => {
    launchIntoFullscreen();
  };

  const onClickTriggerAnimation = () => {
    game.triggerAnimation();
  };

  const onClickCopy = () => {
    if (myId) {
      navigator.clipboard.writeText(myId);
    }
  };

  return (
    <div className="upper-right">
      {/* <button className="flex-end" onClick={() => setShow(!show)}>
        Show
      </button> */}
      {show && (
        <div className="container">
          <div className="shape">
            <div>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button onClick={onClickSend} disabled={!connected}>
                Send
              </Button>
              <Button onClick={onClickResetGame}>Reset Game</Button>
              <Button onClick={onClickStartGame} disabled={!connected}>
                Start Game
              </Button>
              <Button onClick={onClickswapPlayersSides} disabled={!connected}>
                Swap sides
              </Button>
              <Button onClick={onClickFullscreen} disabled={!connected}>
                Fullscreen
              </Button>
              <Button onClick={onClickTriggerAnimation}>Animate</Button>
            </div>
            <div>
              Your Id: <span className="code">{myId}</span>{' '}
              <Button onClick={onClickCopy}>Copy!</Button> and send to Player2
              or
            </div>
            <div>
              <label>Enter</label>
              <input
                type="text"
                placeholder="<Player2 id>"
                value={inputPeerId}
                onChange={(event) => setInputPeerId(event.target.value)}
              />
              <Button onClick={onClickConnect} disabled={!myId}>
                Connect
              </Button>
              <Button onClick={onClickDisconnect} disabled={!connected}>
                Disconnect
              </Button>
            </div>
            <div className="qrcode">
              {myId ? (
                <QRCode
                  value={`${process.env.BASE_URL}/#connectTo=${myId}`}
                  renderAs={'svg'}
                  includeMargin
                />
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debug;
