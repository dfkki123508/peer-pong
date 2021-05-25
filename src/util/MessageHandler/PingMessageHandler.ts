import Game from '../../controllers/Game';
import P2PService from '../../services/P2PService';
import { MESSAGE_EVENTS, PingMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';
import PongMessageHandler from './PongMessageHandler';

class PingMessageHandler extends AbstractMessageHandler<PingMessageDataType> {
  constructor(
    data: PingMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.ping;
  }

  onMessage(): void {
    // console.log('Received ping!', this.data);
    const p2pService = P2PService.getInstance();
    const msg = new PongMessageHandler({
      ...this.data,
    });
    p2pService.sendMessage(msg);
  }
}

export default PingMessageHandler;
