import * as React from 'react';
import { Container, Sprite, Text, useTick } from '@inlet/react-pixi';
import { TextStyle, Texture } from 'pixi.js';
import GameConfig from '../../config/GameConfig';
import Border from './Border/Border';
import Countdown from './Countdown/Countdown';
import { GameController } from '../../controllers/GameController';
import { useObservable, useSharedState } from '../../util/UseObservable';
import {
  ballState$,
  countdownTimer,
  gameState$,
  localPlayerState$,
  remotePlayerState$,
} from '../../services/GameStore';
import { useTouchEvents } from '../../util/UseTouchEvents';

const Game = () => {
  const gameController = GameController.getInstance();

  const [gameState] = useSharedState(gameState$);
  const [localPlayerState, setLocalPlayerState] = useSharedState(
    localPlayerState$,
  );
  const [remotePlayerState] = useSharedState(remotePlayerState$);
  const [ballState] = useSharedState(ballState$);

  const localPlayerRef = React.createRef<PIXI.Sprite>();
  const remotePlayerRef = React.createRef<PIXI.Sprite>();
  const ballRef = React.createRef<PIXI.Sprite>();
  const borderRef = React.createRef<PIXI.Graphics>();

  const touchEvents = useTouchEvents(
    localPlayerState,
    setLocalPlayerState,
    localPlayerRef,
  );

  const countdown = useObservable(countdownTimer.observable$);

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
        ref={localPlayerRef}
        interactive
        // TODO: mask or wrap this sprite to have bigger region to tap on and move this object via touch screen
        {...touchEvents}
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
        ref={remotePlayerRef}
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
      {countdown && countdown > 0 ? (
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
      ) : null}
      {/* <Background /> */}
    </Container>
  );
};

export default Game;
