import { BehaviorSubject, interval, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, throttle } from 'rxjs/operators';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import { Collision, NewPlayerState } from '../types/types';
import { Timer } from '../util/Timer';

export class UpdateSubject<
  T extends { [key: string]: any }
> extends BehaviorSubject<T> {
  update(fn: (oldState: T) => T): void {
    const newState = fn(this.getValue());
    this.next(newState);
  }

  addObserver<U extends T, K extends keyof T>(
    obj: U,
    ...keys: K[]
  ): Subscription {
    // If no keys selected, use all keys from current object
    if (!keys || keys.length === 0) {
      keys = Object.keys(this.getValue());
    }
    return (
      this
        // .pipe(
        // map((v) =>
        //   Object.fromEntries(
        //     Object.entries(v).filter(([key]) => (keys as string[]).includes(key)),
        //   ),
        // ),
        // distinctUntilChanged(),
        // )
        .subscribe((v) => {
          for (const key of keys) {
            obj[key] = v[key];
          }
        })
    );
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

export const newPlayerStore$ = new UpdateSubject<NewPlayerState>({
  y: GameConfig.screen.height / 2,
});

export const remotePlayerStore$ = new UpdateSubject<NewPlayerState>({
  y: GameConfig.screen.height / 2,
});

export const newCollisionStore$ = new UpdateSubject<Collision>(undefined);

