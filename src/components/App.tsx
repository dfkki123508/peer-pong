import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import Debug from './Debug/Debug';
import PixiComponent from './PixiComponent/PixiComponent';

const App = () => {
  return (
    <div className="app-container">
      <div className="game-container">
        <PixiComponent className="game-element" />
      </div>
      {/* {sketch.getState() === GAME_STATE.pause && (
        <Menu open={sketch.getState() === GAME_STATE.pause} />
      )}
      {sketch.getState() === GAME_STATE. && (
        <ReadyToPlay open={gameState.step === GAME_STEP.READY_TO_PLAY} />
      )}
      {gameState.step === GAME_STEP.FINISHED && (
        <Result open={gameState.step === GAME_STEP.FINISHED} />
      )} */}

      <Debug />
    </div>
  );
};

export default hot(module)(App);
