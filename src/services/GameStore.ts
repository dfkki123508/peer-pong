import { BehaviorSubject, Subject } from 'rxjs';
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

export const debugState$ = new UpdateSubject({ freeze: false });
export const gameState$ = new UpdateSubject(getInitialGameState());
export const ballState$ = new UpdateSubject(getInitialBallState());
export const localPlayerState$ = new UpdateSubject(getInitialPlayerState(0));
export const remotePlayerState$ = new UpdateSubject(getInitialPlayerState(1));
export const countdownTimer = new Timer(GameConfig.game.countdownLength);
export const fps$ = new UpdateSubject<number>(0);
export const ballProjection$ = new UpdateSubject<Array<PIXI.Point>>([]);
