import { Point } from 'pixi.js';
import { BallState, GameState, GAME_STEP, PlayerState } from '../types/types';
import { rand } from '../util/Physics';

const GameConfig = {
  player: {
    moveSpeed: 10.0,
    moveAcc: 60.0,
  },
  ball: {
    width: 20,
    height: 20,
    maxAcc: 20,
  },
  game: {
    countdownLength: 3.0, // seconds
    finishScore: 5,
  },
  screen: { height: 600, width: 800, padding: 20 },
  background: {
    numStars: 100,
  },
};

export const getInitialBallState = (): BallState => ({
  x: GameConfig.screen.width / 2,
  y: GameConfig.screen.height / 2,
  sy: GameConfig.player.moveSpeed,
  acceleration: new Point(
    -3, // rand(2.0, 5.0) * (Math.random() < 0.5 ? -1 : 1), // TODO: needs to be synced with peer!!!
    0, // rand(-2.0, 2.0),
  ),
});

export const getInitialPlayerState = (): PlayerState => ({
  y: GameConfig.screen.height / 2,
  sy: GameConfig.player.moveSpeed,
  dxt: Date.now(),
  dyt: Date.now(),
  alpha: 1.0,
});

export const getInitialGameState = (): GameState => ({
  step: GAME_STEP.INIT,
  score: [0, 0],
  switchPlayer: false,
});

export default GameConfig;
