/* eslint-disable react/display-name */
import * as React from 'react';
import { Sprite, _ReactPixi } from '@inlet/react-pixi/animated';
import { Rectangle, Texture } from 'pixi.js';
import { PlayerState } from '../../../types/types';
import { SpringValue } from 'react-spring';

type PlayerProps = _ReactPixi.ISprite &
  PlayerState & {
    children?: React.ReactNode;
    xSpring?: SpringValue<number>;
  };

const Player = React.forwardRef<PIXI.Sprite, PlayerProps>(
  (props: PlayerProps, ref) => {
    // console.log('Props:', props, props.xSpring?.get());

    const { x, ...propsCopy } = props;

    return (
      <Sprite
        texture={Texture.WHITE}
        height={120}
        anchor={0.5}
        hitArea={new Rectangle(-150, -60, 150, 60)}
        ref={ref}
        x={props.xSpring || x}
        {...propsCopy}
      />
    );
  },
);

export default Player;
