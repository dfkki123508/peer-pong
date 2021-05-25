import Game from '../../controllers/Game';
import { FinishGameMessageDataType, MESSAGE_EVENTS } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class FinishGameMessageHandler extends AbstractMessageHandler<FinishGameMessageDataType> {
  constructor(
    data: FinishGameMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.finish_game;
  }

  onMessage(): void {
    console.log('Finish game received', this.data);
    const game = Game.getInstance();
    if (game) {
      game.setScore(this.data);
      game.finishGameTransition();
    }
  }
}

export { FinishGameMessageHandler as default };
