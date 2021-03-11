import React from 'react';
import { Subscription } from 'rxjs';
import { useP2PService } from '../../services/P2PService';

const Debug = () => {
  const p2pService = useP2PService();
  const [message, setMessage] = React.useState('');

  const onClickSend = () => {
    p2pService.sendMessage(message);
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={onClickSend}>Send</button>
    </div>
  );
};

export default Debug;
