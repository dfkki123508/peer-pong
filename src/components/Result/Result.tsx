import React from 'react';
import { GameState } from '../../types/types';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ResultPropsType = {
  open: boolean;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const Result = ({
  open,
  gameState,
  setGameState,
}: ResultPropsType): JSX.Element => {
  return (
    <MenuWrapper open={open}>
      <h2 id="transition-modal-title">
        Under Construction: Here comes the result...
      </h2>
      <div>{gameState.score}</div>
    </MenuWrapper>
  );
};

export default Result;
