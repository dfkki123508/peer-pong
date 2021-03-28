import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import { Stage } from '@inlet/react-pixi';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import Game from './Game/Game';
import { useP2PService } from '../services/P2PService';
import Menu from './Menu/Menu';
import Result from './Result/Result';
import { GAME_STEP } from '../types/types';
import ReadyToPlay from './ReadyToPlay/ReadyToPlay';
import Debug from './Debug/Debug';
import { GameController } from '../controllers/GameController';
import { useSharedState } from '../util/UseObservable';
import { gameStateSubject } from '../services/GameStore';

const App = () => {
  const [gameState, setGameState] = useSharedState(gameStateSubject);

  return (
    <div className="app-container">
      <div className="game-container">
        <Stage
          className="game-element"
          width={GameConfig.screen.width}
          height={GameConfig.screen.height}
          options={{
            backgroundColor: 0x0,
          }}
        >
          <Game />
        </Stage>
      </div>
      {gameState.step === GAME_STEP.INIT && (
        <Menu open={gameState.step === GAME_STEP.INIT} />
      )}
      {gameState.step === GAME_STEP.READY_TO_PLAY && (
        <ReadyToPlay open={gameState.step === GAME_STEP.READY_TO_PLAY} />
      )}
      {gameState.step === GAME_STEP.FINISHED && (
        <Result open={gameState.step === GAME_STEP.FINISHED} />
      )}
      <Debug />
    </div>
  );
};

export default hot(module)(App);
