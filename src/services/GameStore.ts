import React from 'react';
import { Subject } from 'rxjs';

// TODO: move to types.ts
type GameStateType = {
  score: [number, number];
};

// TODO: make rxjs store and handle all game updates, e.g. move players, handle networking, sync state
// TODO: consider an extra store for player/s, objects, etc.
// TODO: consider extra class for controlling operations
export class GameStore {
  public state$: Subject<GameStateType>; // Maybe use behaviourSubject as it emits the current value to new subscribers
  private _stateObject: GameStateType;

  constructor() {
    this.state$ = new Subject<GameStateType>();
    this._stateObject = {
      score: [0, 0],
    };
  }

  getState(): GameStateType {
    return this._stateObject;
  }

  moveLocalPlayer() {}

  moveRemotePlayer() {}

  moveBall() {}

  setLocalPlayersSide() {}

  setStep(step: GAME_STATE) {}

  setScore(score: [number, number]) {
    this._stateObject.score = score;
  }

  scoreForPlayer(playerIdx: 0 | 1) {}

  resetGame() {}
}

export const GameStoreInstance = new GameStore();
export const GameStoreContext = React.createContext(GameStoreInstance);
export const useGameStore = () => React.useContext(GameStoreContext);
