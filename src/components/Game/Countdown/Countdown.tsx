import { Text } from 'pixi.js';
import { applyDefaultProps, PixiComponent } from '@inlet/react-pixi';
import { TextStyle } from 'pixi.js';

type CountdownPropsType = {
  count: number | undefined;
  style?: unknown;
  anchor?:
    | number
    | [number, number]
    | PIXI.Point
    | PIXI.ObservablePoint
    | [number]
    | {
        x: number;
        y: number;
      };
  x?: number;
  y?: number;
};

const Countdown = PixiComponent('Countdown', {
  create: ({ count, style }: CountdownPropsType) => {
    return new Text(
      count ? count.toString() : '',
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
      }),
    );
  },
  applyProps: (instance: PIXI.Text, oldProps, props) => {
    const { count, ...newP } = props;

    // apply rest props to PIXI.Text
    applyDefaultProps(instance, oldProps, newP);

    // set new count
    instance.text = count && count > 0 ? count.toString() : '';
  },
});

export default Countdown;
