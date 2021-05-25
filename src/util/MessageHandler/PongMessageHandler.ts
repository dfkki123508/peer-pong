import P2PService from '../../services/P2PService';
import { MESSAGE_EVENTS, PingMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';
import PingMessageHandler from './PingMessageHandler';

class PongMessageHandler extends AbstractMessageHandler<PingMessageDataType> {
  constructor(
    data: PingMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.pong;
  }

  onMessage(): void {
    const p2pService = P2PService.getInstance();
    const rtt = Date.now() - this.data.pingTimestamp;
    p2pService.addRttValue(rtt);
  }
}

export default PongMessageHandler;
