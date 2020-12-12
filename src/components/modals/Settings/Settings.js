import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import './Settings.css';
import Button from '@material-ui/core/Button';
import AppStore from '../../../stores/AppStore';
import { useAppStore } from '../../../stores/RootStore';

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function Settings(props) {
  const classes = useStyles();
  const appStore = useAppStore();

  setTimeout(() => {
    appStore.goToError();
  }, 3000);

  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={true}
      onClose={props.handleClose}
    >
      <div id="modal-content-wrapper" className={classes.paper}>
        <h2 id="simple-modal-title">Settings</h2>
        <p id="simple-modal-description">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={props.onAccept}
          >
            Accept
          </Button>
        </p>
      </div>
    </Modal>
  );
}
