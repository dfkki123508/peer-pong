import React from 'react';
import { Subscription } from 'rxjs';
import { useP2PService } from '../../services/P2PService';
// import { usePeerSyncService } from '../../services/PeerSyncService';
import './Debug.scss';

const Debug = () => {
  const p2pService = useP2PService();
  // const peerSyncService = usePeerSyncService();
  const [message, setMessage] = React.useState('');

  const onClickSend = () => {
    p2pService.sendMessage(message);
  };

  const onClickReset = () => {
    p2pService.disconnect();
  };

  // React.useEffect(() => {
  //   if (peerSyncService.latency$) {
  //     peerSyncService.latency$.subscribe((n) => console.log('Lat:', n));
  //   }
  // }, [peerSyncService.latency$]);

  return (
    <div className="upper-right">
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={onClickSend}>Send</button>
      <button onClick={onClickReset}>Reset</button>
    </div>
  );
};

export default Debug;
