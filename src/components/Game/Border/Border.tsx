/* eslint-disable react/display-name */
import * as React from 'react';
import { Graphics } from '@inlet/react-pixi/animated';
import { SpringValue, useSpring } from 'react-spring';
import GameConfig from '../../../config/GameConfig';

type BorderPropsType = {
  // x: number;
  // opacity: SpringValue<number>;
};

const Border = React.forwardRef<PIXI.Graphics, BorderPropsType>(
  (props: BorderPropsType, ref) => {

    const draw = React.useCallback((g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(1, 0xfeeb77, 1);
      g.drawRect(
        GameConfig.screen.padding,
        GameConfig.screen.padding,
        GameConfig.screen.width - GameConfig.screen.padding * 2,
        GameConfig.screen.height - GameConfig.screen.padding * 2,
      );
      g.endFill();
    }, []);

    return <Graphics ref={ref} draw={draw} />;
  },
);

export default Border;
