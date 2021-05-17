import Game from '../../controllers/Game';
import { MESSAGE_EVENTS, StartGameMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class StartGameMessageHandler extends AbstractMessageHandler<StartGameMessageDataType> {
  constructor(
    data: StartGameMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.start_game;
  }

  onMessage(): void {
    console.log('Start game received', this.data);
    const game = Game.getInstance();
    if (game) {
      game.setBallState(this.data);
      game.startRoundTransition();
    }
  }
}

export { StartGameMessageHandler as default };