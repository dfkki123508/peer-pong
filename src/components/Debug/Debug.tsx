import React from 'react';
import './Debug.scss';
import Game from '../../controllers/Game';
import QRCode from 'qrcode.react';
import StartGameMessageHandler from '../../util/MessageHandler/StartGameMessageHandler';
import P2PService from '../../services/P2PService';
import { launchIntoFullscreen, mobileCheck } from '../../util/UiHelpers';
import Button from '../Button/Button';
import { gameState$ } from '../../services/GameStore';
import { useObservable } from '../../util/UseObservable';
import { GAME_STATE } from '../../types/types';
import { generateRandomAlphaNumeric } from '../../util/RandStr';

const Debug = () => {
  const p2pService = P2PService.getInstance();
  const [message, setMessage] = React.useState('');
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);
  const [randStr, setRandStr] = React.useState(generateRandomAlphaNumeric(30));
  const [connected, setConnected] = React.useState(false);
  const gameState = useObservable(gameState$);
  const game = Game.getInstance();

  React.useEffect(() => {
    const removeCallback1 = p2pService.registerCallback('open', (peerId) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      console.log('me', peerId);
      setMyId(peerId);
    });
    const removeCallback2 = p2pService.registerCallback('conn-close', () => {
      setConnected(false);
    });
    const removeCallback3 = p2pService.registerCallback('conn-open', () => {
      setConnected(true);
    });
    return () => {
      removeCallback1();
      removeCallback2();
      removeCallback3();
    };
  }, [p2pService]);

  const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRandStr(generateRandomAlphaNumeric(30));
    }, 100);
  }, []);

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
        setInputPeerId('');
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

  const getConnectUrl = () => {
    if (myId) {
      return `${process.env.BASE_URL}/#connectTo=${myId}`;
    }
    return randStr;
  };

  return (
    <div
      className={
        'upper-right' + (gameState !== GAME_STATE.pause ? ' playing' : '')
      }
    >
      <div className="container">
        <div className="shape">
          {connected ? (
            <>
              <div className="flex-item">
                <Button onClick={onClickStartGame} disabled={!connected}>
                  Start Game
                </Button>
              </div>
              <div className="flex-item">
                <Button onClick={onClickDisconnect} disabled={!connected}>
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1>Welcome to Peer-Pong</h1>
              <div className="flex-item">
                <Button onClick={onClickCopy} disabled={!myId}>
                  Copy your Id!
                </Button>
              </div>
              <input
                className="flex-item"
                type="text"
                placeholder="<Player2 id>"
                value={inputPeerId}
                onChange={(event) => setInputPeerId(event.target.value)}
              />
              <div className="flex-item">
                <Button
                  onClick={onClickConnect}
                  disabled={!myId}
                  className="flex-item"
                >
                  Connect
                </Button>
              </div>
              <div className="qrcode flex-item">
                <QRCode
                  value={getConnectUrl()}
                  renderAs={'svg'}
                  includeMargin
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug;
