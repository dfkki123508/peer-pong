import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import SettingsForm from './SettingsForm';




const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    root: {
        width: 300,
    },
    margin: {
        height: theme.spacing(3),
    }
}));

export default function GameSettingsModal(props) {
    const classes = useStyles();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={true}
            onClose={props.handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={true}>
                <div className={classes.paper}>
                    <h2 id="transition-modal-title">Select game mode</h2>
                    <SettingsForm
                        onStartGameClicked={props.onStartGameClicked}
                        peerId={props.peerId}
                        myPeerId={props.myPeerId}
                    />
                </div>
            </Fade>
        </Modal>
    );
}
