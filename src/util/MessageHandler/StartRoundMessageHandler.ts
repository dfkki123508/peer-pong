import Game from '../../controllers/Game';
import P2PService from '../../services/P2PService';
import { MESSAGE_EVENTS, StartRoundMessageDataType } from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';

class StartRoundMessageHandler extends AbstractMessageHandler<StartRoundMessageDataType> {
  constructor(
    data: StartRoundMessageDataType,
    timestampCreated: number = Date.now(),
  ) {
    super(data, timestampCreated);
    this.event = MESSAGE_EVENTS.start_round;
  }

  onMessage(): void {
    console.log('Start round received', this.data);
    const p2pService = P2PService.getInstance();
    const game = Game.getInstance();
    if (game) {
      const delay = Date.now() - this.timestampCreated;
      console.log('with Delay', delay, 'avg. latency', p2pService.avgLatency);
      game.setBallState(this.data.ball);
      game.setScore(this.data.score);
      game.startRoundTransition(-p2pService.avgLatency);
    }
  }
}

export { StartRoundMessageHandler as default };
