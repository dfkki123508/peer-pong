import React from 'react';
import * as PIXI from 'pixi.js';
import Sketch from '../../controllers/Sketch';

type PixiComponentProps = PixiApplicationOptions;

type PixiApplicationOptions = {
  autoStart?: boolean;
  width?: number;
  height?: number;
  view?: HTMLCanvasElement;
  transparent?: boolean;
  autoDensity?: boolean;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  resolution?: number;
  forceCanvas?: boolean;
  backgroundColor?: number;
  clearBeforeRender?: boolean;
  powerPreference?: string;
  sharedTicker?: boolean;
  sharedLoader?: boolean;
  resizeTo?: Window | HTMLElement;
};

const PixiComponent = (props: PixiComponentProps): JSX.Element => {
  const wrapperRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const app = new PIXI.Application(props);

    let canvas: HTMLCanvasElement;
    if (wrapperRef && wrapperRef.current) {
      canvas = wrapperRef.current.appendChild(app.view);
    }

    const sketch = new Sketch(app);

    return () => {
      app.destroy();
      if (canvas) {
        canvas.remove();
      }
      sketch.cleanup();
    };
  }, [props, wrapperRef]);

  return <div ref={wrapperRef} />;
};

export default PixiComponent;
