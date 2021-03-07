import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import { Stage } from '@inlet/react-pixi';
import GameConfig, { getInitialGameState } from '../config/GameConfig';
import Game from './Game/Game';
import { useP2PService } from '../services/P2PService';
import Menu from './Menu/Menu';
import Result from './Result/Result';
import { GAME_STATE, PlayersSide } from '../types/types';
import ReadyToPlay from './ReadyToPlay/ReadyToPlay';
import { launchIntoFullscreen } from '../util/Fullscreen';

function getHashValue(key: string) {
  const matches = location.hash.match(new RegExp(key + '=([^&]*)'));
  return matches ? matches[1] : null;
}

const App = () => {
  const p2pService = useP2PService();
  const [gameState, setGameState] = React.useState(getInitialGameState());
  const [playersSide, setPlayersSide] = React.useState<PlayersSide>('LEFT');

  // If called with connectTo url param, directly connect
  React.useEffect(() => {
    const peerId = getHashValue('connectTo');
    if (peerId) {
      p2pService.idSubject.subscribe((meId) => {
        p2pService.connect(peerId);
        setGameState({ ...gameState, state: GAME_STATE.READY_TO_PLAY });
      });
    }
  }, []);

  // On connection, switch to ready to play
  React.useEffect(() => {
    p2pService.newConnection.subscribe(() => {
      setPlayersSide('RIGHT');
      setGameState({ ...gameState, state: GAME_STATE.READY_TO_PLAY });
    });
  }, [p2pService.newConnection]);

  // TODO: also subscribe to disconnects, and reset to INIT state

  // Launch fullscreen when switching to ready to play
  React.useEffect(() => {
    if (gameState.state === GAME_STATE.READY_TO_PLAY) {
      launchIntoFullscreen(document.documentElement);
    }
  }, [gameState.state]);

  // DEBUG
  // React.useEffect(() => {
  //   console.log('Update app: changing game state in 3s', gameState);
  //   if (gameState.state === GAME_STATE.INIT) {
  //     setTimeout(
  //       () => setGameState({ ...gameState, state: GAME_STATE.READY_TO_PLAY }),
  //       3000,
  //     );
  //   } else if (gameState.state === GAME_STATE.READY_TO_PLAY) {
  //     setTimeout(
  //       () => setGameState({ ...gameState, state: GAME_STATE.PLAYING }),
  //       3000,
  //     );
  //   } else if (gameState.state === GAME_STATE.PLAYING) {
  //     setTimeout(
  //       () => setGameState({ ...gameState, state: GAME_STATE.FINISHED }),
  //       3000,
  //     );
  //   } else if (gameState.state === GAME_STATE.FINISHED) {
  //     setTimeout(
  //       () => setGameState({ ...gameState, state: GAME_STATE.INIT }), // loop
  //       3000,
  //     );
  //   }
  // }, [gameState]);

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
          <Game
            gameState={gameState}
            setGameState={setGameState}
            playersSide={playersSide}
          />
        </Stage>
      </div>
      {/* TODO: check if removing the menus completely from the DOM (instead of hiding) makes more sense */}
      <Menu
        open={gameState.state === GAME_STATE.INIT}
        gameState={gameState}
        setGameState={setGameState}
      />
      <ReadyToPlay
        open={gameState.state === GAME_STATE.READY_TO_PLAY}
        gameState={gameState}
        setGameState={setGameState}
      />
      <Result
        open={gameState.state === GAME_STATE.FINISHED}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
};

export default hot(module)(App);
