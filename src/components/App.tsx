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
import { GAME_STATE, PlayersSide } from '../types/types';
import ReadyToPlay from './ReadyToPlay/ReadyToPlay';
import { launchIntoFullscreen } from '../util/Fullscreen';
import Debug from './Debug/Debug';

function getHashValue(key: string) {
  const matches = location.hash.match(new RegExp(key + '=([^&]*)'));
  return matches ? matches[1] : null;
}

const App = () => {
  const p2pService = useP2PService();
  const [gameState, setGameState] = React.useState(getInitialGameState());
  const [playersSide, setPlayersSide] = React.useState<PlayersSide>('LEFT');

  const [player1State, setPlayer1State] = React.useState(
    getInitialPlayerState(),
  );
  const [player2State, setPlayer2State] = React.useState(
    getInitialPlayerState(),
  );
  const [ballState, setBallState] = React.useState(getInitialBallState());

  // // If called with connectTo url param, directly connect
  React.useEffect(() => {
    const peerId = getHashValue('connectTo');
    if (peerId) {
      const sub = p2pService.peer$.subscribe((peer) => {
        p2pService.connect(peerId);
        setPlayersSide('RIGHT');
        // setGameState({ ...gameState, state: GAME_STATE.READY_TO_PLAY });
      });
      return () => sub.unsubscribe();
    }
  }, []);

  // On connection, switch to ready to play
  React.useEffect(() => {
    const sub = p2pService.peer$.subscribe((peer) => {
      console.log('Checking if there are connections:', peer);
      if (Object.keys(peer.connections).length > 0) {
        setGameState((prevState) => ({
          ...prevState,
          state: GAME_STATE.READY_TO_PLAY,
        }));
      }
    });
    return () => sub.unsubscribe();
  }, [p2pService.peer$]);

  React.useEffect(() => {
    const sub = p2pService.peer$.subscribe({
      next: (peer) => console.log('PEERCHANGED', peer.id, peer),
      complete: () => console.log('peer cmpleeted'),
      error: (err) => console.error(err),
    });
    return () => sub.unsubscribe();
  }, [p2pService.peer$]);

  //Register handler on disconnect: reset state to init
  React.useEffect(() => {
    console.log('Registering message subscription');
    if (p2pService.message$) {
      const sub = p2pService.message$.subscribe({
        complete: () => {
          console.log('Disconnected!!!');
          setGameState({ ...gameState, state: GAME_STATE.INIT });
        },
      });
      return () => sub.unsubscribe();
    }
  }, [p2pService.message$]);

  // Launch fullscreen when switching to ready to play
  // React.useEffect(() => {
  //   if (gameState.state === GAME_STATE.READY_TO_PLAY) {
  //     launchIntoFullscreen(document.documentElement);
  //   }
  // }, [gameState.state]);

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
            player1State={player1State}
            player2State={player2State}
            ballState={ballState}
            setGameState={setGameState}
            setPlayer1State={setPlayer1State}
            setPlayer2State={setPlayer2State}
            setBallState={setBallState}
            playersSide={playersSide}
          />
        </Stage>
      </div>
      {/* TODO: check if removing the menus completely from the DOM (instead of hiding) makes more sense */}
      {gameState.state === GAME_STATE.INIT && (
        <Menu
          open={gameState.state === GAME_STATE.INIT}
          gameState={gameState}
          setGameState={setGameState}
          setPlayersSide={setPlayersSide}
        />
      )}
      {gameState.state === GAME_STATE.READY_TO_PLAY && (
        <ReadyToPlay
          open={gameState.state === GAME_STATE.READY_TO_PLAY}
          gameState={gameState}
          setGameState={setGameState}
          ballState={ballState}
          setBallState={setBallState}
        />
      )}
      {gameState.state === GAME_STATE.FINISHED && (
        <Result
          open={gameState.state === GAME_STATE.FINISHED}
          gameState={gameState}
          setGameState={setGameState}
        />
      )}
      <Debug />
    </div>
  );
};

export default hot(module)(App);
