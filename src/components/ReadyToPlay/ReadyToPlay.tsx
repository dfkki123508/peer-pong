import React from 'react';
import Game, { GAME_STATE } from '../../controllers/Game';
import { sendStartGame } from '../../controllers/Remote';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ReadyToPlayPropsType = {
  open: boolean;
};

const ReadyToPlay = ({ open }: ReadyToPlayPropsType): JSX.Element => {
  const game = Game.getInstance();

  const onClickPlay = () => {
    const ballState = game.getBallState();
    sendStartGame(ballState);
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
