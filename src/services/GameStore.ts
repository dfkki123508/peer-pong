import { BehaviorSubject, interval, Subject, Subscription } from 'rxjs';
import { throttle } from 'rxjs/operators';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import { Collision } from '../types/types';
import { Timer } from '../util/Timer';

export class UpdateSubject<T> extends BehaviorSubject<T> {
  update(fn: (oldState: T) => T): void {
    const newState = fn(this.getValue());
    this.next(newState);
  }

  addObserver<U, K extends keyof U>(obj: U, key: K): Subscription {
    return this.subscribe((v) => (obj[key] = v));
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

export const newPlayerStore$ = new UpdateSubject<number>(
  GameConfig.screen.height / 2,
);

export const remotePlayerStore$ = new UpdateSubject<number>(
  GameConfig.screen.height / 2,
);

export const newCollisionStore$ = new UpdateSubject<Collision | undefined>(
  undefined,
);

// Debug
newCollisionStore$.pipe().subscribe((v) => console.log('Collisionstream:', v));
