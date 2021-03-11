import { Graphics } from 'pixi.js';
import { PixiComponent } from '@inlet/react-pixi';

type BorderPropsType = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: number;
};

const Border = PixiComponent('Border', {
  create: (props: BorderPropsType) => new Graphics(),
  applyProps: (instance, _, props) => {
    const { x, y, width, height, fill } = props;
    instance.clear();
    instance.lineStyle(1, 0xfeeb77, 1);
    instance.beginFill(fill);
    instance.drawRect(x, y, width, height);
    instance.endFill();
  },
});

export default Border;
