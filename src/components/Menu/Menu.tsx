import React from 'react';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Debug from '../Debug/Debug';
import './Menu.scss';
import { useP2PService } from '../../services/P2PService';
import QRCode from 'qrcode.react';
import { launchIntoFullscreen } from '../../util/Fullscreen';
import { getInitialGameState } from '../../config/GameConfig';
import { GameState } from '../../types/types';

type MenuPropsType = {
  open: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const Menu = ({
  open,
  setMenuOpen,
  handleClose,
  gameState,
  setGameState,
}: MenuPropsType) => {
  const p2pService = useP2PService();
  const [showDebugInfo, setShowDebugInfo] = React.useState(true);
  const [peerId, setPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    p2pService.newConnection.subscribe(startGame); // On connection start game immediatly

    p2pService.idSubject.subscribe((meId) => {
      console.log('me', meId);
      setMyId(meId);
    });
  }, []);

  const startGame = () => {
    setGameState({ ...gameState, started: true });
    setMenuOpen(false);
  };

  const onClickConnect = () => {
    if (peerId && peerId != '') {
      // Connect and subscribe to data
      p2pService.connect(peerId);
      setConnected(true);
      setGameState({ ...gameState, switchPlayer: true });
      launchIntoFullscreen(document.documentElement); // TODO: apply to all start functions
      startGame();
    } else {
      alert('Invalid peer id:' + peerId);
    }
  };

  const onClickCopy = (e) => {
    if (myId) {
      navigator.clipboard.writeText(myId);
    }
  };

  const onClickPlay = (e) => {
    console.log('Starting game');
    // p2pService.sendMessage({ event: 'start_game' });
    startGame();
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className="menu-root"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      disableBackdropClick
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className="content">
          {/* <button onClick={() => setShowDebugInfo(true)}>Debug info</button> */}
          <h2 id="transition-modal-title">
            Connect{connected ? 'ed' : ''} with Player2
          </h2>
          {connected ? (
            <div>
              <button onClick={onClickPlay}>Play!</button>
            </div>
          ) : (
            <div>
              <p id="transition-modal-description">
                <div>
                  Your Id: <span className="code">{myId}</span>{' '}
                  <button onClick={onClickCopy}>Copy!</button> and send to
                  Player2 or
                </div>
                <div>
                  <label>Enter</label>
                  <input
                    type="text"
                    placeholder="<Player2 id>"
                    value={peerId}
                    onChange={(event) => setPeerId(event.target.value)}
                  />
                  <button onClick={onClickConnect}>Connect</button>
                </div>
              </p>
              <div className="qrcode">
                {myId ? (
                  <QRCode
                    value={`http://192.168.1.6:8080/#connectTo=${myId}`}
                  />
                ) : (
                  ''
                )}
              </div>
            </div>
          )}
          {/* {showDebugInfo ? <Debug /> : ''} */}
        </div>
      </Fade>
    </Modal>
  );
};

export default Menu;
