import Game from '../../controllers/Game';
import P2PService from '../../services/P2PService';
import { BallUpdateMessageDataType, MESSAGE_EVENTS } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class BallUpdateMessageHandler extends AbstractMessageHandler<BallUpdateMessageDataType> {
  constructor(
    data: BallUpdateMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.ball_update;
  }

  onMessage(): void {
    console.log('Should process ball update', this.data);
    const p2pService = P2PService.getInstance();
    const game = Game.getInstance();
    if (game) {
      // Do some interpolation because of network delay
      const delay = Date.now() - this.timestampCreated;
      console.log('Delay', delay, 'latency', p2pService.avgLatency);
      const mult = p2pService.avgLatency / (1000.0 / 60.0); // 60 FPS
      this.data.x += this.data.vx * mult;
      this.data.y += this.data.vy * mult;

      game.setBallState(this.data);
    }
  }
}

export { BallUpdateMessageHandler as default };
