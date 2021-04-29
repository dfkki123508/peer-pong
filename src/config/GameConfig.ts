import { Point } from 'pixi.js';
import { BallState, GameState, GAME_STEP, PlayerState } from '../types/types';
import { rand } from '../util/Physics';

console.log('PROCESS.env:', process.env);

const GameConfig = {
  player: {
    moveSpeed: 35.0,
    moveAcc: 70.0,
    maxMoveSpeed: 100,
  },
  ball: {
    width: 20,
    height: 20,
    maxAcc: 20,
    speedUp: 1.1,
  },
  game: {
    countdownLength: 3.0, // seconds
    finishScore: 5,
  },
  screen: { height: 600, width: 800, padding: 20 },
  background: {
    numStars: 100,
  },
  debug: {
    on: true,
  },
};

export const getInitialBallState = (): BallState => ({
  x: GameConfig.screen.width / 2,
  y: GameConfig.screen.height / 2,
  sy: GameConfig.player.moveSpeed,
  acceleration: new Point(
    rand(2.0, 5.0) * (Math.random() < 0.5 ? -1 : 1),
    rand(-2.0, 2.0),
  ),
});

export const getInitialPlayerState = (player: 0 | 1): PlayerState => ({
  x: player
    ? GameConfig.screen.padding
    : GameConfig.screen.width - GameConfig.screen.padding,
  y: GameConfig.screen.height / 2,
  sy: GameConfig.player.moveSpeed,
  dxt: Date.now(),
  dyt: Date.now(),
  alpha: 1.0,
});

export const getInitialGameState = (): GameState => ({
  step: GAME_STEP.INIT,
  score: [0, 0],
});

export default GameConfig;
