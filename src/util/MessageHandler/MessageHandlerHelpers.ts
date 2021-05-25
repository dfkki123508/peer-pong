import {
  GenericMessage,
  MESSAGE_EVENTS,
  MovePlayerMessageDataType,
  BallUpdateMessageDataType,
  StartRoundMessageDataType,
  StartGameMessageDataType,
  FinishGameMessageDataType,
  PingMessageDataType,
} from '../../types/types';
import AbstractMessageHandler from './AbstractMessageHandler';
import BallUpdateMessageHandler from './BallUpdateMessageHandler';
import FinishGameMessageHandler from './FinishGameMessageHandler';
import MovePlayerMessageHandler from './MovePlayerMessageHandler';
import PingMessageHandler from './PingMessageHandler';
import PongMessageHandler from './PongMessageHandler';
import StartGameMessageHandler from './StartGameMessageHandler';
import StartRoundMessageHandler from './StartRoundMessageHandler';

export function getHandler(
  msg: GenericMessage,
): AbstractMessageHandler | undefined {
  switch (msg.event) {
    case MESSAGE_EVENTS.move_player:
      return new MovePlayerMessageHandler(
        msg.data as MovePlayerMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.ball_update:
      return new BallUpdateMessageHandler(
        msg.data as BallUpdateMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.start_round:
      return new StartRoundMessageHandler(
        msg.data as StartRoundMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.start_game:
      return new StartGameMessageHandler(
        msg.data as StartGameMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.finish_game:
      return new FinishGameMessageHandler(
        msg.data as FinishGameMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.ping:
      return new PingMessageHandler(
        msg.data as PingMessageDataType,
        msg.timestampCreated,
      );
    case MESSAGE_EVENTS.pong:
      return new PongMessageHandler(
        msg.data as PingMessageDataType,
        msg.timestampCreated,
      );
  }
}
