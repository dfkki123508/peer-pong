import { BehaviorSubject } from 'rxjs';
import {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';

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
