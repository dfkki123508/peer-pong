import React from 'react';
import { filter } from 'rxjs/operators';
import { useP2PService } from '../../services/P2PService';
import { GameState, GAME_STATE, MESSAGE_EVENTS } from '../../types/types';
import MenuWrapper from '../MenuWrapper/MenuWrapper';

type ReadyToPlayPropsType = {
  open: boolean;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const ReadyToPlay = ({
  open,
  gameState,
  setGameState,
}: ReadyToPlayPropsType): JSX.Element => {
  const p2pService = useP2PService();

  const onClickPlay = (e) => {
    console.log('Starting game');
    p2pService.sendMessage({ event: 'start_game' }); // TODO!
    setGameState({ ...gameState, state: GAME_STATE.PLAYING });
  };

  React.useEffect(() => {
    console.log("Waiting for other players' response...");
    const sub = p2pService
      .getMessage()
      .pipe(
        filter((d) => d.event === MESSAGE_EVENTS[MESSAGE_EVENTS.start_game]),
      )
      .subscribe((msg) => {
        console.log('Starting game!', msg);
        setGameState({ ...gameState, state: GAME_STATE.PLAYING });
      });
    return () => sub.unsubscribe();
  }, [p2pService]);

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
