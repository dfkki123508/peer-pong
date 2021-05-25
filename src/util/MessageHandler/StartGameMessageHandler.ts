import Game from '../../controllers/Game';
import { gameState$ } from '../../services/GameStore';
import P2PService from '../../services/P2PService';
import {
  GAME_STATE,
  MESSAGE_EVENTS,
  StartGameMessageDataType,
} from '../../types/types';
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
    const p2pService = P2PService.getInstance();
    const game = Game.getInstance();
    if (game && gameState$.getValue() === GAME_STATE.pause) {
      // TODO: use p2pService latency here, in case browser times are out of sync
      const delay = Date.now() - this.timestampCreated;
      console.log('with Delay', delay, 'avg. latency', p2pService.avgLatency);
      game.startGameTransition(-p2pService.avgLatency);
      game.setBallState(this.data);
    }
  }
}

export { StartGameMessageHandler as default };
