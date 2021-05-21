import { BehaviorSubject } from 'rxjs';
import { getInitialGameState } from '../config/GameConfig';

export class UpdateSubject<
  T extends { [key: string]: any }
> extends BehaviorSubject<T> {
  update(fn: (oldState: T) => T): void {
    const newState = fn(this.getValue());
    this.next(newState);
  }
}

export const gameState$ = new UpdateSubject(getInitialGameState());
