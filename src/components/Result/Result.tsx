import React from 'react';
import { gameStateSubject } from '../../services/GameStore';
import { GameState } from '../../types/types';
import { useSharedState } from '../../util/UseObservable';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ResultPropsType = {
  open: boolean;
};

const Result = ({ open }: ResultPropsType): JSX.Element => {
  const [gameState, setGameState] = useSharedState(gameStateSubject);
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
