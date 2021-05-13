import Game from '../../controllers/Game';
import { BallUpdateMessageDataType, MESSAGE_EVENTS } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class BallUpdateMessageHandler extends AbstractMessageHandler<BallUpdateMessageDataType> {
  constructor(
    data: BallUpdateMessageDataType,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    super(data, timestampCreated, timestampReceived);
    this.event = MESSAGE_EVENTS.ball_update;
  }

  onMessage(): void {
    console.log('Should process ball update', this.data);
    const game = Game.getInstance();
    if (game) {
      // Do some interpolation because of network delay
      const delay = this.timestampReceived - this.timestampCreated;
      const mult = delay / (1000.0 / 60.0); // 60 FPS
      this.data.x += this.data.vx * mult;
      this.data.y += this.data.vy * mult;

      game.setBallState(this.data);
    }
  }
}

export { BallUpdateMessageHandler as default };
