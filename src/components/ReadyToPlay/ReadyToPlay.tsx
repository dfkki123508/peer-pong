import React from 'react';
import { filter } from 'rxjs/operators';
import { useP2PService } from '../../services/P2PService';
import {
  BallState,
  GameState,
  GAME_STEP,
  MESSAGE_EVENTS,
} from '../../types/types';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ReadyToPlayPropsType = {
  open: boolean;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  ballState: BallState;
  setBallState: React.Dispatch<React.SetStateAction<BallState>>;
};

const ReadyToPlay = ({
  open,
  gameState,
  setGameState,
  ballState,
  setBallState,
}: ReadyToPlayPropsType): JSX.Element => {
  const p2pService = useP2PService();

  const onClickPlay = () => {
    console.log('Starting game');
    p2pService.sendMessage({
      event: MESSAGE_EVENTS.start_game,
      data: ballState,
    });
    setGameState({ ...gameState, step: GAME_STEP.PLAYING });
  };

  React.useEffect(() => {
    console.log("Waiting for other players' response...");
    if (p2pService.message$) {
      const sub = p2pService.message$
        .pipe(filter((d) => d.event === MESSAGE_EVENTS.start_game))
        .subscribe((msg) => {
          console.log('Starting game!', msg);
          // setBallState(msg.data);
          setGameState({ ...gameState, step: GAME_STEP.PLAYING });
        });
      return () => sub.unsubscribe();
    }
  }, [p2pService.message$]);

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
