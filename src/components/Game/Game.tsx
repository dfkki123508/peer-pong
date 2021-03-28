import * as React from 'react';
import { Container, Sprite, Text } from '@inlet/react-pixi';
import { TextStyle, Texture } from 'pixi.js';
import GameConfig from '../../config/GameConfig';
import { useP2PService } from '../../services/P2PService';
import Border from './Border/Border';
import { GAME_STEP } from '../../types/types';
import Countdown from './Countdown/Countdown';
import Background from './Background/Background';
import { GameController } from '../../controllers/GameController';
import { useSharedState } from '../../util/UseObservable';
import {
  ballStateSubject,
  gameStateSubject,
  localPlayerStateSubject,
  remotePlayerStateSubject,
} from '../../services/GameStore';

const Game = () => {
  const gameController = GameController.getInstance();

  const [gameState, setGameState] = useSharedState(gameStateSubject);
  const [localPlayerState, setLocalPlayerState] = useSharedState(
    localPlayerStateSubject,
  );
  const [remotePlayerState, setRemotePlayerState] = useSharedState(
    remotePlayerStateSubject,
  );
  const [ballState, setBallState] = useSharedState(ballStateSubject);

  const player1Ref = React.createRef<PIXI.Sprite>();
  const player2Ref = React.createRef<PIXI.Sprite>();
  const ballRef = React.createRef<PIXI.Sprite>();
  const borderRef = React.createRef<PIXI.Graphics>();
  const waitForRestart = React.useRef(false);

  // const touchEvents = useTouchEvents(player1State, setPlayer1State, player1Ref);

  const [countdown, setCountdown] = React.useState(
    GameConfig.game.countdownLength,
  );

  // Countdown timer
  React.useEffect(() => {
    if (gameState.step === GAME_STEP.PLAYING && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevState) => prevState - 1);
      }, 1000);
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  React.useEffect(() => {
    console.log('Registering listener');

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowUp') {
        gameController.moveLocalPlayer('UP');
      } else if (event.key === 'ArrowDown') {
        gameController.moveLocalPlayer('DOWN');
      }
    }

    window.addEventListener('keydown', handleKeyDown, false);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [gameController]);

  // useTick((delta) => {
  //   if (
  //     delta &&
  //     gameState.step === GAME_STEP.PLAYING &&
  //     countdown <= 0 &&
  //     player1Ref.current &&
  //     player2Ref.current &&
  //     ballRef.current &&
  //     borderRef.current
  //   ) {
  //     const p1 = player1Ref.current;
  //     const p2 = player2Ref.current;
  //     const ball = ballRef.current;
  //     const border = borderRef.current;

  //     if (checkIfObjectInCanvas(ball)) {
  //       setBallState((prevState) =>
  //         ballUpdate(prevState, delta, p1, p2, ball, border),
  //       );
  //     }
  //     // ball is out of game, i.e. score
  //     else if (!waitForRestart.current) {
  //       const scoreIdx = +!(
  //         ball.x + ball.width / 2 >
  //         GameConfig.screen.width - GameConfig.screen.padding
  //       );
  //       console.log('SCORE!');
  //       setGameState((oldGameState: GameState) => {
  //         const newState = Object.assign({}, oldGameState) as GameState;
  //         newState.score[scoreIdx]++;
  //         return newState;
  //       });
  //       waitForRestart.current = true;
  //       setTimeout(nextRound, 2000);
  //     }
  //   }
  // });

  // const nextRound = () => {
  //   resetObjects();
  //   waitForRestart.current = false;
  // };

  const scoreText = (): string => {
    return `${gameState.score[0]}:${gameState.score[1]}`;
  };

  return (
    <Container>
      <Border
        x={GameConfig.screen.padding}
        y={GameConfig.screen.padding}
        width={GameConfig.screen.width - GameConfig.screen.padding * 2}
        height={GameConfig.screen.height - GameConfig.screen.padding * 2}
        ref={borderRef}
      />
      <Sprite
        texture={Texture.WHITE}
        tint={0x123456}
        height={120}
        anchor={0.5}
        ref={player1Ref}
        interactive
        // TODO: mask or wrap this sprite to have bigger region to tap on and move this object via touch screen
        // {...touchEvents}
        {...localPlayerState}
      />
      <Sprite
        // image="../assets/img/ball.png"
        texture={Texture.WHITE}
        tint={0xffffff}
        anchor={0.5}
        width={GameConfig.ball.width}
        height={GameConfig.ball.height}
        ref={ballRef}
        {...ballState}
      />
      <Sprite
        texture={Texture.WHITE}
        tint={0xffffff}
        anchor={0.5}
        height={120}
        ref={player2Ref}
        {...remotePlayerState}
      />
      <Text
        text={scoreText()}
        anchor={0.5}
        x={GameConfig.screen.width / 2}
        y={GameConfig.screen.height - GameConfig.screen.padding}
        style={
          new TextStyle({
            align: 'center',
            fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
            fontSize: 50,
            fontWeight: '400',
            fill: ['#ffffff'], // gradient
            stroke: '#ffffff',
            strokeThickness: 5,
            letterSpacing: 20,
            dropShadow: true,
            dropShadowColor: '#ccced2',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
          })
        }
      />
      {countdown >= 0 ? (
        <Countdown
          count={countdown}
          anchor={0.5}
          x={GameConfig.screen.width / 2}
          y={GameConfig.screen.height / 2}
          style={
            new TextStyle({
              align: 'center',
              fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
              fontSize: 50,
              fontWeight: '400',
              fill: ['#ffffff'], // gradient
              stroke: '#ffffff',
              strokeThickness: 5,
              letterSpacing: 20,
              dropShadow: true,
              dropShadowColor: '#ccced2',
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 6,
              dropShadowDistance: 6,
              wordWrap: true,
              wordWrapWidth: 440,
            })
          }
        />
      ) : (
        ''
      )}
      <Background />
    </Container>
  );
};

export default Game;
