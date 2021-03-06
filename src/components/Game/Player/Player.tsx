import React from 'react';
import { Sprite } from '@inlet/react-pixi';

const Player = () => {
  return (
    <Sprite
      texture={Texture.WHITE}
      tint={0xffffff}
      height={120}
      ref={playerRef}
      {...playerState}
    />
  );
};

export default Player;
