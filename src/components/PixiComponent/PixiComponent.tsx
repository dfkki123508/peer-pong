import React from 'react';
import * as PIXI from 'pixi.js';

type PixiComponentProps = {
  sketch: (app: PIXI.Application) => void;
} & PixiApplicationOptions;

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

const PixiComponent = ({
  sketch,
  ...appProps
}: PixiComponentProps): JSX.Element => {
  const wrapperRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const app = new PIXI.Application(appProps);

    let canvas: HTMLCanvasElement;
    if (wrapperRef && wrapperRef.current) {
      canvas = wrapperRef.current.appendChild(app.view);
    }

    sketch(app);

    return () => {
      if (canvas) {
        canvas.remove();
      }
      console.log('Cleaning up', sketch.cleanup);
      if (sketch.cleanup) {
        sketch.cleanup();
      }
    };
  }, [wrapperRef, sketch, appProps]);

  return <div ref={wrapperRef} />;
};

export default PixiComponent;
