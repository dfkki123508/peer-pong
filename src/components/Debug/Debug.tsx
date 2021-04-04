import React from 'react';
import { Stage, useApp } from '@inlet/react-pixi';
import { useP2PService } from '../../services/P2PService';
// import { usePeerSyncService } from '../../services/PeerSyncService';
import './Debug.scss';
import { useObservable, useSharedState } from '../../util/UseObservable';
import { fps$ } from '../../services/GameStore';
import { throttle } from 'rxjs/operators';
import { interval } from 'rxjs';
import { GameController } from '../../controllers/GameController';

type DebugProps = {
  pixiAppRef: React.RefObject<
    Stage & {
      app: PIXI.Application;
    }
  >;
};

const Debug = ({ pixiAppRef }: DebugProps) => {
  const p2pService = useP2PService();
  const gameController = GameController.getInstance();
  // const peerSyncService = usePeerSyncService();
  const [message, setMessage] = React.useState('');
  const [show, setShow] = React.useState(true);
  const fps = useObservable(fps$.pipe(throttle(() => interval(500)))); // Throttle fps updates

  const onClickResetRound = () => {
    gameController.resetRound(false, true);
    gameController.startRound();
  };

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
      <button className="flex-end" onClick={() => setShow(!show)}>
        Show
      </button>
      {show && (
        <div>
          <div>{fps?.toFixed(2)} fps</div>
          <div>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button onClick={onClickSend}>Send</button>
            <button onClick={onClickResetRound}>Reset Round</button>
            <button onClick={onClickReset}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debug;
