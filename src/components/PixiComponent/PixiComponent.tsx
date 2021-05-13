import React from 'react';
import Game from '../../controllers/Game';

type PixiComponentProps = {
  className: string;
};

const PixiComponent = (props: PixiComponentProps): JSX.Element => {
  const wrapperRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const sketch = Game.getInstance();

    let canvas: HTMLCanvasElement;
    if (wrapperRef && wrapperRef.current) {
      canvas = wrapperRef.current.appendChild(sketch.app.view);
    }

    return () => {
      sketch.destroy();
      if (canvas) {
        canvas.remove();
      }
    };
  }, [wrapperRef]);

  return <div ref={wrapperRef} {...props} />;
};

export default PixiComponent;
