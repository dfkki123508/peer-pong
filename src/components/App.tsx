import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import { Stage } from '@inlet/react-pixi';
import GameConfig, { getInitialGameState } from '../config/GameConfig';
import Game from './Game/Game';
import { useP2PService } from '../services/P2PService';
import Menu from './Menu/Menu';

function getHashValue(key: string) {
  const matches = location.hash.match(new RegExp(key + '=([^&]*)'));
  return matches ? matches[1] : null;
}

const App = () => {
  const p2pService = useP2PService();
  const [menuOpen, setMenuOpen] = React.useState(true);
  const [gameState, setGameState] = React.useState(getInitialGameState());

  React.useEffect(() => {
    const peerId = getHashValue('connectTo');
    if (peerId) {
      p2pService.idSubject.subscribe((meId) => {
        p2pService.connect(peerId);
        setGameState({ ...gameState, started: true, switchPlayer: true });
        setMenuOpen(false);
      });
    }
  }, []);

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
          <Game gameState={gameState} setGameState={setGameState} />
        </Stage>
      </div>
      <Menu
        open={menuOpen}
        setMenuOpen={setMenuOpen}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
};

export default hot(module)(App);
