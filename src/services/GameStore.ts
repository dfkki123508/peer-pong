import { BehaviorSubject } from 'rxjs';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import { Timer } from '../util/Timer';

export class UpdateSubject<T> extends BehaviorSubject<T> {
  update(fn: (oldState: T) => T): void {
    const newState = fn(this.getValue());
    this.next(newState);
  }
}

export const gameStateSubject = new UpdateSubject(getInitialGameState());
export const localPlayerStateSubject = new UpdateSubject(
  getInitialPlayerState(0),
);
export const remotePlayerStateSubject = new UpdateSubject(
  getInitialPlayerState(1),
);
export const ballStateSubject = new UpdateSubject(getInitialBallState());

export const countdownTimer = new Timer(GameConfig.game.countdownLength);
