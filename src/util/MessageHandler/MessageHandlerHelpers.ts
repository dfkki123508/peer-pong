import {
  GenericMessage,
  MESSAGE_EVENTS,
  MovePlayerMessageDataType,
  BallUpdateMessageDataType,
  StartRoundMessageDataType,
  StartGameMessageDataType,
  FinishGameMessageDataType,
} from '../../types/types';
import BallUpdateMessageHandler from './BallUpdateMessageHandler';
import FinishGameMessageHandler from './FinishGameMessageHandler';
import MovePlayerMessageHandler from './MovePlayerMessageHandler';
import StartGameMessageHandler from './StartGameMessageHandler';
import StartRoundMessageHandler from './StartRoundMessageHandler';

export function getHandler(
  msg: GenericMessage,
):
  | MovePlayerMessageHandler
  | BallUpdateMessageHandler
  | StartRoundMessageHandler
  | StartGameMessageHandler
  | FinishGameMessageHandler
  | undefined {
  switch (msg.event) {
    case MESSAGE_EVENTS.move_player:
      return new MovePlayerMessageHandler(
        msg.data as MovePlayerMessageDataType,
        msg.timestampCreated,
        msg.timestampReceived,
      );
    case MESSAGE_EVENTS.ball_update:
      return new BallUpdateMessageHandler(
        msg.data as BallUpdateMessageDataType,
        msg.timestampCreated,
        msg.timestampReceived,
      );
    case MESSAGE_EVENTS.start_round:
      return new StartRoundMessageHandler(
        msg.data as StartRoundMessageDataType,
        msg.timestampCreated,
        msg.timestampReceived,
      );
    case MESSAGE_EVENTS.start_game:
      return new StartGameMessageHandler(
        msg.data as StartGameMessageDataType,
        msg.timestampCreated,
        msg.timestampReceived,
      );
    case MESSAGE_EVENTS.finish_game:
      return new FinishGameMessageHandler(
        msg.data as FinishGameMessageDataType,
        msg.timestampCreated,
        msg.timestampReceived,
      );
  }
}
