import React from 'react';
import './Menu.scss';
import { useP2PService } from '../../services/P2PService';
import QRCode from 'qrcode.react';
import { GameState, GAME_STATE, PlayersSide } from '../../types/types';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type MenuPropsType = {
  open: boolean;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setPlayersSide: React.Dispatch<React.SetStateAction<PlayersSide>>;
};

const Menu = ({
  open,
  gameState,
  setGameState,
  setPlayersSide,
}: MenuPropsType): JSX.Element => {
  const p2pService = useP2PService();
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);

  React.useEffect(() => {
    const sub = p2pService.peer$.subscribe((peer) => {
      console.log('me', peer.id);
      setMyId(peer.id);
    });
    return () => sub.unsubscribe();
  }, []);

  const onClickConnect = () => {
    if (inputPeerId && inputPeerId != '') {
      // Connect and subscribe to data
      p2pService.connect(inputPeerId);
      setPlayersSide('RIGHT');  // TODO: BETTER SEND VIA MESSAGE TO REMOTE
      // setGameState({ ...gameState, state: GAME_STATE.READY_TO_PLAY });
    } else {
      alert('Invalid peer id:' + inputPeerId);
    }
  };

  const onClickCopy = (e) => {
    if (myId) {
      navigator.clipboard.writeText(myId);
    }
  };

  return (
    <MenuWrapper open={open}>
      <h2 id="transition-modal-title">Connect with Player2</h2>
      <div>
        <div id="transition-modal-description">
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
          </div>
        </div>
        <div className="qrcode">
          {myId ? (
            <QRCode value={`http://192.168.1.6:8080/#connectTo=${myId}`} />
          ) : (
            ''
          )}
        </div>
      </div>
    </MenuWrapper>
  );
};

export default Menu;
