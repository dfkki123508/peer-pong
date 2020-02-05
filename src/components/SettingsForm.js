import React from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import P2PService from '../services/P2PService'
import './SettingsForm.css';


const marks = [
    {
        value: 3,
        label: '3',
    },
    {
        value: 5,
        label: '5',
    },
    {
        value: 7,
        label: '7',
    },
    {
        value: 9,
        label: '∞',
    },
];


class SettingsForm extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            winningScore: 3,
            bestOfRounds: 3,
            otherPeerId: props.peerId || '',  //anit-pattern to use prop to init state
            localVSP2P: 1
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.onStartGameClicked(this.state);
    }

    handleTabChange(event, newValue) {
        this.setState({ localVSP2P: newValue });
    }

    isStartable() {
        if (this.state.localVSP2P === 1) {
            return this.state.otherPeerId !== '';
        }
        return true;
    }

    render() {
        return (
            <Paper square className="SettingsFormWrapper" >
                <Tabs
                    value={this.state.localVSP2P}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={this.handleTabChange}
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Local" id="local-tab" />
                    <Tab label="P2P" id="p2p-tab" />
                </Tabs>

                <form onSubmit={this.onSubmit} className="SettingsForm">
                    <TextField
                        id="outlined-number"
                        label="Winning Score"
                        type="number"
                        value={this.state.winningScore}
                        InputLabelProps={{
                            shrink: true
                        }}
                        InputProps={{ inputProps: { min: 1, max: 20 } }}
                        variant="outlined"
                        onInput={e => {
                            let p = parseInt(e.target.value, 10);
                            if (!isNaN(p)) {
                                this.setState({ winningScore: p });
                            }
                        }}
                    />
                    <div>
                        <Typography id="best-of-rounds-slider" gutterBottom>
                            {this.state.bestOfRounds == 9 ? 'No limits' : `Best of ${this.state.bestOfRounds}`}
                        </Typography>
                        <Slider
                            defaultValue={3}
                            aria-labelledby="best-of-rounds-slider"
                            step={2}
                            valueLabelDisplay="off"
                            marks={marks}
                            min={3}
                            max={9}
                            onChangeCommitted={(_, value) => this.setState({ bestOfRounds: value })}
                        />
                    </div>

                    {this.state.localVSP2P === 1 &&
                        <div id="other-peer-id-div">
                            <TextField
                                helperText={"Your ID: " + this.props.myPeerId}
                                id="other-peer-id-input"
                                label="Peer Id"
                                value={this.state.otherPeerId}
                                onInput={e => this.setState({ otherPeerId: e.target.value })}
                            />
                        </div>
                    }
                    <Button variant="contained" color="primary" type="submit" disabled={!this.isStartable()}>
                        Start Game
                    </Button>
                </form>
            </Paper>
        );
    }
}

export default SettingsForm;