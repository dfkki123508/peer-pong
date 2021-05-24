import * as React from 'react';
import { hot } from 'react-hot-loader';
import './App.scss';
import Button from './Button/Button';
import Debug from './Debug/Debug';
import Menu from './Menu/Menu';
import PixiComponent from './PixiComponent/PixiComponent';

const App = () => {
  return (
    <div className="app-container">
      <div className="game-container">
        <PixiComponent className="game-element" />
      </div>
      <Debug />
    </div>
    // <>
    //   <Button>Normal</Button>
    //   <Button disabled>disabled</Button>
    //   <input />
    // </>
  );
};

export default hot(module)(App);
