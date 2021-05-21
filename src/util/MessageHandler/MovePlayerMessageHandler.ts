import Game from '../../controllers/Game';
import { MESSAGE_EVENTS, MovePlayerMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class MovePlayerMessageHandler extends AbstractMessageHandler<MovePlayerMessageDataType> {
  constructor(
    data: MovePlayerMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.move_player;
  }

  onMessage(): void {
    const game = Game.getInstance();
    game.setPlayer2State(this.data);
  }
}

export { MovePlayerMessageHandler as default };
