import * as React from 'react';
import { useTick, Container, Sprite, Text } from '@inlet/react-pixi';
import { TextStyle, Texture } from 'pixi.js';
import { filter } from 'rxjs/operators';
import GameConfig, {
  getInitialBallState,
  getInitialPlayerState,
} from '../../config/GameConfig';
import { ballUpdate, checkIfObjectInCanvas } from '../../util/Physics';
import { useP2PService } from '../../services/P2PService';
import Border from './Border/Border';
import {
  BallState,
  GameState,
  GAME_STEP,
  MESSAGE_EVENTS,
  PlayersSide,
  PlayerState,
} from '../../types/types';
import Countdown from './Countdown/Countdown';
import Background from './Background/Background';
import { useTouchEvents } from '../../util/UseTouchEvents';

type GamePropsType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  player1State: PlayerState;
  setPlayer1State: React.Dispatch<React.SetStateAction<PlayerState>>;
  player2State: PlayerState;
  setPlayer2State: React.Dispatch<React.SetStateAction<PlayerState>>;
  ballState: BallState;
  setBallState: React.Dispatch<React.SetStateAction<BallState>>;
  playersSide: PlayersSide;
};

const Game = ({
  gameState,
  setGameState,
  playersSide,
  player1State,
  setPlayer1State,
  player2State,
  setPlayer2State,
  ballState,
  setBallState,
}: GamePropsType) => {
  const p2pService = useP2PService();

  const player1Ref = React.createRef<PIXI.Sprite>();
  const player2Ref = React.createRef<PIXI.Sprite>();
  const ballRef = React.createRef<PIXI.Sprite>();
  const borderRef = React.createRef<PIXI.Graphics>();
  const waitForRestart = React.useRef(false);

  const touchEvents = useTouchEvents(player1State, setPlayer1State, player1Ref);

  const [countdown, setCountdown] = React.useState(
    GameConfig.game.countdownLength,
  );

  // Countdown timer
  React.useEffect(() => {
    // console.log('useEffect for timer');
    if (gameState.step === GAME_STEP.PLAYING && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevState) => prevState - 1);
      }, 1000);
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  // Finish condition
  React.useEffect(() => {
    // console.log('useEffect for timer');
    if (
      gameState.step != GAME_STEP.FINISHED &&
      Math.max(...gameState.score) >= GameConfig.game.finishScore
    ) {
      setGameState({ ...gameState, step: GAME_STEP.FINISHED });
    }
  }, [gameState]);

  // Register subscription to messages and move player, when there's data.
  React.useEffect(() => {
    console.log('Subscribing to player 2 data', p2pService.message$);
    if (p2pService.message$) {
      const sub = p2pService.message$
        .pipe(filter((d) => d['event'] === MESSAGE_EVENTS.move_player))
        .subscribe({
          next: (msg) => setPlayer2State(msg.data as PlayerState),
          complete: () => resetObjects(),
        });
      return () => sub.unsubscribe();
    }
  }, [p2pService.message$]);

  const movePlayer = (dy: number) => {
    setPlayer1State((oldState) => {
      const dt = Date.now() - oldState.dyt;
      // console.log('dt', dt, oldState.sy);
      const newState = {
        ...oldState,
        y: oldState.y + dy,
        sy: (GameConfig.player.moveSpeed * GameConfig.player.moveAcc) / dt,
        dyt: Date.now(),
      };

      // send to other player
      try {
        p2pService.sendMessage({
          event: MESSAGE_EVENTS.move_player,
          data: newState,
        });
      } catch (err) {
        console.error(err);
      }
      return newState;
    });
  };

  const moveUp = () => {
    movePlayer(-player1State.sy);
  };

  const moveDown = () => {
    movePlayer(+player1State.sy);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      moveUp();
    } else if (event.key === 'ArrowDown') {
      moveDown();
    }
  };

  React.useEffect(() => {
    console.log('Registering listener');
    window.addEventListener('keydown', handleKeyDown, false);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

  useTick((delta) => {
    if (
      delta &&
      gameState.step === GAME_STEP.PLAYING &&
      countdown <= 0 &&
      player1Ref.current &&
      player2Ref.current &&
      ballRef.current &&
      borderRef.current
    ) {
      const p1 = player1Ref.current;
      const p2 = player2Ref.current;
      const ball = ballRef.current;
      const border = borderRef.current;

      if (checkIfObjectInCanvas(ball)) {
        setBallState((prevState) =>
          ballUpdate(prevState, delta, p1, p2, ball, border),
        );
      }
      // ball is out of game, i.e. score
      else if (!waitForRestart.current) {
        const scoreIdx = +!(
          ball.x + ball.width / 2 >
          GameConfig.screen.width - GameConfig.screen.padding
        );
        console.log('SCORE!');
        setGameState((oldGameState: GameState) => {
          const newState = Object.assign({}, oldGameState) as GameState;
          newState.score[scoreIdx]++;
          return newState;
        });
        waitForRestart.current = true;
        setTimeout(nextRound, 2000);
      }
    }
  });

  const resetObjects = () => {
    setBallState((prevState) => ({
      ...prevState,
      ...getInitialBallState(),
    }));
    setPlayer1State((prevState) => ({
      ...prevState,
      ...getInitialPlayerState(),
    }));
    setPlayer2State((prevState) => ({
      ...prevState,
      ...getInitialPlayerState(),
    }));
    setCountdown(GameConfig.game.countdownLength);
  };

  const nextRound = () => {
    resetObjects();
    waitForRestart.current = false;
  };

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
        x={
          playersSide === 'LEFT'
            ? GameConfig.screen.padding
            : GameConfig.screen.width - GameConfig.screen.padding
        }
        {...touchEvents}
        {...player1State}
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
        x={
          playersSide === 'RIGHT'
            ? GameConfig.screen.padding
            : GameConfig.screen.width - GameConfig.screen.padding
        }
        {...player2State}
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
