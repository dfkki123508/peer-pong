/* eslint-disable react/display-name */
import * as React from 'react';
import { Graphics, Sprite } from '@inlet/react-pixi';
import { Point, Texture } from 'pixi.js';
import GameConfig from '../../../config/GameConfig';
import { ballProjection$, ballState$ } from '../../../services/GameStore';
import { useSharedState } from '../../../util/UseObservable';
import { addVector, multScalar } from '../../../util/VectorOperations';

const Ball = React.forwardRef<PIXI.Sprite>((_props, ref) => {
  const [ballState] = useSharedState(ballState$);
  const [ballProjection] = useSharedState(ballProjection$);

  const drawMomentum = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      if (ballState && ballState.acceleration instanceof Point) {
        g.lineStyle(4, 0xffd900, 1);
        g.moveTo(ballState.x, ballState.y);
        const ballP2 = addVector(
          multScalar(ballState.acceleration.clone(), 10),
          new Point(ballState.x, ballState.y),
        );
        g.lineTo(ballP2.x, ballP2.y);
      }
    },
    [ballState],
  );

  const drawProjection = React.useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (ballProjection.length > 0) {
        g.lineStyle(2, 0xffd900, 1);
        g.moveTo(ballProjection[0].x, ballProjection[0].y);

        for (let i = 0; i < ballProjection.length; i++) {
          const point = ballProjection[i];
          g.lineTo(point.x, point.y);
        }
      }
    },
    [ballProjection],
  );

  return (
    <>
      <Sprite
        // image="../assets/img/ball.png"
        texture={Texture.WHITE}
        tint={0xffffff}
        anchor={0.5}
        width={GameConfig.ball.width}
        height={GameConfig.ball.height}
        ref={ref}
        {...ballState}
      />
      <Graphics draw={drawMomentum} />
      <Graphics draw={drawProjection} />
    </>
  );
});

export default Ball;
