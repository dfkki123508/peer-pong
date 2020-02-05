import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import './GameInviteModal.css';
import Button from '@material-ui/core/Button';

// function rand() {
//     return Math.round(Math.random() * 20) - 10;
// }
// 
// function getModalStyle() {
//     const top = 50 + rand();
//     const left = 50 + rand();
//     return {
//         top: `${top}%`,
//         left: `${left}%`,
//         transform: `translate(-${top}%, -${left}%)`,
//     };
// }

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function SimpleModal(props) {
    const classes = useStyles();

    return (
        <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={true}
            onClose={props.handleClose}
        >
            <div id="modal-content-wrapper" className={classes.paper}>
                <h2 id="simple-modal-title">Game Invite from {props.name}</h2>
                <p id="simple-modal-description">
                    <Button variant="contained" color="primary" type="submit" onClick={props.onAccept}>
                        Accept
                    </Button>
                </p>
            </div>
        </Modal>
    );
}
