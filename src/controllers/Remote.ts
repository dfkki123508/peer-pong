import P2PService from '../services/P2PService';
import {
  BallUpdateMessageDataType,
  FinishGameMessageDataType,
  MovePlayerMessageDataType,
  StartGameMessageDataType,
  StartRoundMessageDataType,
} from '../types/types';
import BallUpdateMessageHandler from '../util/MessageHandler/BallUpdateMessageHandler';
import FinishGameMessageHandler from '../util/MessageHandler/FinishGameMessageHandler';
import MovePlayerMessageHandler from '../util/MessageHandler/MovePlayerMessageHandler';
import StartGameMessageHandler from '../util/MessageHandler/StartGameMessageHandler';
import StartRoundMessageHandler from '../util/MessageHandler/StartRoundMessageHandler';

export function sendBallUpdate(data: BallUpdateMessageDataType): void {
  console.log('Sending ballupdate after collision');
  const p2pService = P2PService.getInstance();
  if (p2pService.getNextOpenConnection()) {
    const message = new BallUpdateMessageHandler(data);
    p2pService.sendMessage(message);
  }
}

export function sendMovePlayer(data: MovePlayerMessageDataType): void {
  const message = new MovePlayerMessageHandler(data);
  const p2pService = P2PService.getInstance();
  if (p2pService.getNextOpenConnection()) {
    p2pService.sendMessage(message);
  }
}

export function sendFinishGame(data: FinishGameMessageDataType): void {
  const msg = new FinishGameMessageHandler(data);
  const p2pService = P2PService.getInstance();
  p2pService.sendMessage(msg);
}

export function sendStartRound(data: StartRoundMessageDataType): void {
  const msg = new StartRoundMessageHandler(data);
  const p2pService = P2PService.getInstance();
  p2pService.sendMessage(msg);
}

export function sendStartGame(data: StartGameMessageDataType): void {
  const msg = new StartGameMessageHandler(data);
  const p2pService = P2PService.getInstance();
  p2pService.sendMessage(msg);
}
