import React from 'react';
import * as PIXI from 'pixi.js';
import Sketch from '../../controllers/Sketch';
import { PixiApplicationOptions } from '../../types/types';

// type PixiComponentProps = PixiApplicationOptions;

const PixiComponent = (): JSX.Element => {
  const wrapperRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const sketch = Sketch.getInstance();

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

  return <div ref={wrapperRef} />;
};

export default PixiComponent;
