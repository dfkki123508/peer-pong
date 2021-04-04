import React from 'react';
import { Backdrop, Modal, Zoom } from '@material-ui/core';
import './MenuWrapper.scss';

type MenuWrapperProps = {
  open: boolean;
  handleClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  children: React.ReactNode;
};

// TODO: write on dialog component, such that:
// * clicking on background is still possible
// * looks more game like
const MenuWrapper = ({
  open,
  handleClose,
  ...props
}: MenuWrapperProps): JSX.Element => {
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className="menu-root"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      disableBackdropClick
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Zoom in={open} timeout={750}>
        <div className="content">{props.children}</div>
      </Zoom>
    </Modal>
  );
};

export default MenuWrapper;
