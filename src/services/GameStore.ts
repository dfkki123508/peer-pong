import { BehaviorSubject } from 'rxjs';
import Game from '../controllers/Game';
import { GameStateFn, GAME_STATE } from '../types/types';

export class UpdateSubject<T> extends BehaviorSubject<T> {
  update(fn: (oldState: T) => T): void {
    const newState = fn(this.getValue());
    this.next(newState);
  }
}

export const gameState$ = new UpdateSubject<GAME_STATE>(GAME_STATE.pause);

// const GAME_STATE_FN_MAPPING = {
//   [GAME_STATE.pause]: undefined,
//   [GAME_STATE.play]: Game.play,
//   [GAME_STATE.start_round]: Game.startRoundState,
// };