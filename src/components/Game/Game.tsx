import * as React from 'react';
import { Spring } from 'react-spring';
import GameConfig from '../../config/GameConfig';
import Border from './Border/Border';
import Countdown from './Countdown/Countdown';
import { GameController } from '../../controllers/GameController';
import { useObservable, useSharedState } from '../../util/UseObservable';
import {
  countdownTimer,
  localPlayerState$,
  remotePlayerState$,
} from '../../services/GameStore';
import { useTouchEvents } from '../../util/UseTouchEvents';
import Ball from './Ball/Ball';
import Player from './Player/Player';
import ScoreText from './ScoreText/ScoreText';
import { Container, useApp, useTick } from '@inlet/react-pixi/animated';
// import { Container } from '@inlet/react-pixi';

const Game = (): JSX.Element => {
  const gameController = GameController.getInstance();

  const [localPlayerState, setLocalPlayerState] = useSharedState(
    localPlayerState$,
  );
  const [remotePlayerState] = useSharedState(remotePlayerState$);
  const countdown = useObservable(countdownTimer.observable$);

  const localPlayerRef = React.createRef<PIXI.Sprite>();
  const remotePlayerRef = React.createRef<PIXI.Sprite>();
  const ballRef = React.createRef<PIXI.Sprite>();
  const borderRef = React.createRef<PIXI.Graphics>();

  const touchEvents = useTouchEvents(
    localPlayerState,
    setLocalPlayerState,
    localPlayerRef,
  );

  // Register keydown listener
  React.useEffect(() => {
    window.addEventListener('keydown', gameController.handleKeyDown, false);
    return () => {
      window.removeEventListener(
        'keydown',
        gameController.handleKeyDown,
        false,
      );
    };
  }, []);

  useTick((delta) =>
    gameController.tick(
      delta,
      localPlayerRef.current,
      remotePlayerRef.current,
      ballRef.current,
      borderRef.current,
      countdown,
    ),
  );

  return (
    <Container>
      <Border ref={borderRef} />}
      <Player
        tint={0x123456}
        ref={localPlayerRef}
        interactive
        {...touchEvents}
        {...localPlayerState}
      />
      <Ball ref={ballRef} />
      <Player tint={0xffffff} ref={remotePlayerRef} {...remotePlayerState} />
      <ScoreText />
      {/* <Countdown
        count={countdown}
        anchor={0.5}
        x={GameConfig.screen.width / 2}
        y={GameConfig.screen.height / 2}
      /> */}
      {/* <Background /> */}
    </Container>
  );
};

export default Game;
