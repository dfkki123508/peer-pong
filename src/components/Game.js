import React, { useState } from 'react';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketch';

import './Game.css';

export default function Game(props) {


    return (
        <div className="Game">
            {/* <p id="dummy">Here will be the game rendered</p> */}
            <P5Wrapper sketch={sketch} />
        </div>
    );
}