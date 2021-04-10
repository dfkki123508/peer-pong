/* eslint-disable react/display-name */
import * as React from 'react';
import { Sprite, _ReactPixi } from '@inlet/react-pixi';
import { Rectangle, Texture } from 'pixi.js';
import { PlayerState } from '../../../types/types';

type PlayerProps = _ReactPixi.ISprite & {
  children?: React.ReactNode;
  state?: PlayerState;
};

const Player = React.forwardRef<PIXI.Sprite, PlayerProps>(
  (props: PlayerProps, ref) => {
    return (
      <Sprite
        texture={Texture.WHITE}
        height={120}
        anchor={0.5}
        hitArea={new Rectangle(-150, -60, 150, 60)}
        ref={ref}
        {...props}
      />
    );
  },
);

export default Player;
