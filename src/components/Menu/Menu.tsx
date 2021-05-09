import React from 'react';
import './Menu.scss';
import { useP2PService } from '../../services/P2PService';
import QRCode from 'qrcode.react';
import MenuWrapper from '../MenuWrapper/MenuWrapper';
import { GameController } from '../../controllers/GameController';

type MenuPropsType = {
  open: boolean;
};

const Menu = ({ open }: MenuPropsType): JSX.Element => {
  const p2pService = useP2PService();
  const gameController = GameController.getInstance();
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);

  React.useEffect(() => {
    const sub = p2pService.peer$.subscribe((peer) => {
      console.log('me', peer.id);
      setMyId(peer.id);
    });
    return () => sub.unsubscribe();
  }, [p2pService.peer$]);

  const onClickConnect = () => {
    if (inputPeerId && inputPeerId != '') {
      gameController.connectToRemote(inputPeerId);
    } else {
      alert('Invalid peer id:' + inputPeerId);
    }
  };

  const onClickCopy = () => {
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
            <QRCode value={`${process.env.BASE_URL}/#connectTo=${myId}`} />
          ) : (
            ''
          )}
        </div>
      </div>
    </MenuWrapper>
  );
};

export default Menu;
