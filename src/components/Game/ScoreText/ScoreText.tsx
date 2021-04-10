import * as React from 'react';
import { gameState$ } from '../../../services/GameStore';
import { useSharedState } from '../../../util/UseObservable';
import { Text } from '@inlet/react-pixi';
import GameConfig from '../../../config/GameConfig';
import { TextStyle } from 'pixi.js';

const ScoreText = () => {
  const [gameState] = useSharedState(gameState$);

  const scoreText = (): string => {
    return `${gameState.score[0]}:${gameState.score[1]}`;
  };

  return (
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
  );
};

export default ScoreText;
