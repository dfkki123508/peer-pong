import React, { useState } from 'react';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketch';

import './Game.css';

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = { height: null, width: null };
    }

    componentDidMount() {
        const height = this.divElement.clientHeight;
        const width = this.divElement.clientWidth;
        console.log(height, width);
        this.setState({ height, width });
    }

    render() {
        return (
            <div className="Game" ref={(divElement) => { this.divElement = divElement }}>
                {(this.state.height && this.state.width) ? (
                    <P5Wrapper sketch={sketch} width={this.state.width} height={this.state.height} />
                ) : (
                        <p id="dummy">Here will be the game rendered</p>
                    )
                }
            </div>
        );
    }
}

export default Game;