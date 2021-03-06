import { Text } from 'pixi.js';
import { applyDefaultProps, PixiComponent } from '@inlet/react-pixi';

type CountdownPropsType = {
  count: number;
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
    return new Text(count.toString(), style);
  },
  applyProps: (instance: PIXI.Text, oldProps, props) => {
    const { count, ...newP } = props;

    // apply rest props to PIXI.Text
    applyDefaultProps(instance, oldProps, newP);

    // set new count
    instance.text = count > 0 ? count.toString() : '';
  },
});

export default Countdown;
