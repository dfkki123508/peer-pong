import Game from '../../controllers/Game';
import { MESSAGE_EVENTS, StartRoundMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class StartRoundMessageHandler extends AbstractMessageHandler<StartRoundMessageDataType> {
  constructor(
    data: StartRoundMessageDataType,
    timestampCreated: number = Date.now(),
    timestampReceived?: number,
  ) {
    super(data, timestampCreated, timestampReceived);
    this.event = MESSAGE_EVENTS.start_round;
  }

  onMessage(): void {
    console.log('Start round received', this.data);
    const game = Game.getInstance();
    if (game) {
      game.setBallState(this.data.ball);
      game.setScore(this.data.score);
      game.startRoundTransition();
    }
  }
}

export { StartRoundMessageHandler as default };
