import React from 'react';
import Game, { GAME_STATE } from '../../controllers/Game';
import { useP2PService } from '../../services/P2PService';
import StartGameMessageHandler from '../../util/MessageHandler/StartGameMessageHandler';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ReadyToPlayPropsType = {
  open: boolean;
};

const ReadyToPlay = ({ open }: ReadyToPlayPropsType): JSX.Element => {
  const game = Game.getInstance();
  const p2pService = useP2PService();

  const onClickPlay = () => {
    const ballState = game.getBallState();
    const msg = new StartGameMessageHandler(ballState);
    p2pService.sendMessage(msg);
    game.setState(GAME_STATE.start_round);
  };

  return (
    <MenuWrapper open={open}>
      <h2 id="transition-modal-title">Connect with Player2</h2>
      <div>
        <button onClick={onClickPlay}>Play!</button>
      </div>
    </MenuWrapper>
  );
};

export default ReadyToPlay;
