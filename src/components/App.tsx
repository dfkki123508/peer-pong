import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import { Stage } from '@inlet/react-pixi/animated';
import GameConfig from '../config/GameConfig';
import Game from './Game/Game';
import Menu from './Menu/Menu';
import Result from './Result/Result';
import { GAME_STEP } from '../types/types';
import ReadyToPlay from './ReadyToPlay/ReadyToPlay';
import Debug from './Debug/Debug';
import { useSharedState } from '../util/UseObservable';
import { gameState$, fps$ } from '../services/GameStore';
import * as PIXI from 'pixi.js';

const defaultRender = PIXI.Renderer.prototype.render;

let last = 0;

// Tap into pixi renderer to calculate fps
PIXI.Renderer.prototype.render = function render(...args): void {
  const current = performance.now();
  fps$.next(1000 / (current - last));
  last = current;
  defaultRender.apply(this, args);
};

const App = () => {
  const [gameState] = useSharedState(gameState$);
  const stageRef = React.createRef<Stage & { app: PIXI.Application }>();

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
          // onPointerUp={() => setTransform(set)}
          ref={stageRef}
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
      <Debug pixiAppRef={stageRef} />
    </div>
  );
};

export default hot(module)(App);
