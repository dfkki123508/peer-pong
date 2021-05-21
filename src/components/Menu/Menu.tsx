import React from 'react';
import './Menu.scss';
import QRCode from 'qrcode.react';
import MenuWrapper from '../MenuWrapper/MenuWrapper';
import Game from '../../controllers/Game';
import P2PService from '../../services/P2PService';

type MenuPropsType = {
  open: boolean;
};

const Menu = ({ open }: MenuPropsType): JSX.Element => {
  const game = Game.getInstance();
  const p2pService = P2PService.getInstance();
  const [inputPeerId, setInputPeerId] = React.useState('');
  const [myId, setMyId] = React.useState(p2pService.me?.id || undefined);

  React.useEffect(() => {
    const removeCallback = p2pService.registerCallback('open', (peerId) => {
      console.log('me', peerId);
      setMyId(peerId);
    });
    return () => removeCallback();
  }, [p2pService]);

  const onClickConnect = async () => {
    if (inputPeerId && inputPeerId != '') {
      try {
        await p2pService.connect(inputPeerId);
        game.swapPlayersSides();
        game.master = true;
      } catch (err) {
        console.error(err);
      }
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
