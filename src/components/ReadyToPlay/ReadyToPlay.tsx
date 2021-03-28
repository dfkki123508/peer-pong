import React from 'react';
import { GameController } from '../../controllers/GameController';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ReadyToPlayPropsType = {
  open: boolean;
};

const ReadyToPlay = ({ open }: ReadyToPlayPropsType): JSX.Element => {
  const gameController = GameController.getInstance();

  return (
    <MenuWrapper open={open}>
      <h2 id="transition-modal-title">Connect with Player2</h2>
      <div>
        <button onClick={() => gameController.startGame()}>Play!</button>
      </div>
    </MenuWrapper>
  );
};

export default ReadyToPlay;
