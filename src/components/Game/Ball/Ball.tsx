import React from 'react';
import { Sprite } from '@inlet/react-pixi';
import GameConfig from '../../../config/GameConfig';

const Ball = () => {
  return (
    <Sprite
      // image="../assets/img/ball.png"
      texture={Texture.WHITE}
      tint={0xffffff}
      anchor={[0.5, 0.5]}
      width={20}
      height={20}
      position={[GameConfig.screen.width / 2, GameConfig.screen.height / 2]}
      ref={ballRef}
      // {...ballState}
    />
  );
};

export default Ball;
