import { Observer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import {
  ballStateSubject,
  countdownTimer,
  gameStateSubject,
  localPlayerStateSubject,
  remotePlayerStateSubject,
} from '../services/GameStore';
import MessageDispatcher from '../services/MessageDispatcher';
import { P2PServiceInstance } from '../services/P2PService';
import {
  GameState,
  GAME_STEP,
  Message,
  MESSAGE_EVENTS,
  PlayerState,
} from '../types/types';
import { ballUpdate, checkIfObjectInCanvas } from '../util/Physics';
import { getHashValue } from '../util/UiHelpers';

export class GameController {
  static instance: GameController;
  static numInstances = 0;

  private p2pService = P2PServiceInstance;
  private messageDispatcher: MessageDispatcher;

  private gameState = gameStateSubject;
  private localPlayerState = localPlayerStateSubject;
  private remotePlayerState = remotePlayerStateSubject;
  private ballState = ballStateSubject;
  private countdownTimer = countdownTimer;

  private pause = false;

  private constructor() {
    GameController.numInstances++;
    console.log('New game controller instance ', GameController.numInstances);
    console.log('p2pservice:', this.p2pService);

    this.updateRemotePlayer = this.updateRemotePlayer.bind(this);
    this.gameStateObserver = this.gameStateObserver.bind(this);
    this.startGame = this.startGame.bind(this);
    this.resetGame = this.resetGame.bind(this);

    this.messageDispatcher = new MessageDispatcher();
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.move_player,
      this.updateRemotePlayer,
    );
    this.messageDispatcher.registerCallback(MESSAGE_EVENTS.start_game, () =>
      this.startGame(false),
    );

    const peerId = getHashValue('connectTo');

    if (peerId) {
      this.p2pService.peer$.subscribe(() => this.connectToRemote(peerId));
    }

    this.gameState.subscribe(this.gameStateObserver);

    // On connection, switch to ready to play
    P2PServiceInstance.conn$.subscribe((messageObservable) => {
      if (messageObservable) {
        console.log('New connection! Setting gamestate to ready-to-play...');
        gameStateSubject.update((x) => ({
          ...x,
          step: GAME_STEP.READY_TO_PLAY,
        }));
        messageObservable.subscribe(this.messageObserver());
      }
    });
  }

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  gameStateObserver(gameState: GameState): void {
    console.log('New game state!', gameState);
    if (
      gameState.step != GAME_STEP.FINISHED &&
      Math.max(...gameState.score) >= 2 //GameConfig.game.finishScore
    ) {
      this.gameState.update((x) => ({ ...x, step: GAME_STEP.FINISHED }));
    }
    // TODO: Launch fullscreen when switching to ready to play
  }

  messageObserver(): Observer<Message> {
    return {
      next: (msg) => this.messageDispatcher.dispatch(msg),
      complete: this.resetGame,
      error: (err) => console.error(err),
    };
  }

  startGame(sendToRemote = true): void {
    console.log('Starting game');
    if (sendToRemote) {
      this.p2pService.sendMessage({
        event: MESSAGE_EVENTS.start_game,
        data: this.ballState.getValue(),
      });
    }
    this.resetCountdown();
    this.gameState.update((oldState) => ({
      ...oldState,
      step: GAME_STEP.PLAYING,
    }));
  }

  resetGame(): void {
    console.log('Resetting game...');
    this.gameState.next(getInitialGameState());
    this.resetRound();
  }

  resetRound(): void {
    this.localPlayerState.update((oldState) => ({
      ...getInitialPlayerState(0),
      x: oldState.x,
    }));
    this.remotePlayerState.update((oldState) => ({
      ...getInitialPlayerState(1),
      x: oldState.x,
    }));
    this.ballState.next(getInitialBallState());
    this.resetCountdown();
  }

  resetCountdown(): void {
    this.countdownTimer.start();
  }

  swapPlayersSides(): void {
    let localX = this.localPlayerState.getValue().x;
    let remoteX = this.remotePlayerState.getValue().x;
    const copyX = remoteX;

    remoteX = localX;
    localX = copyX;

    this.localPlayerState.update((oldState) => ({ ...oldState, x: localX }));
    this.remotePlayerState.update((oldState) => ({ ...oldState, x: remoteX }));
  }

  connectToRemote(inputPeerId: string): void {
    this.p2pService.connect(inputPeerId); // TODO: check that peer me id is ready before
    this.swapPlayersSides();
  }

  moveLocalPlayer(dir: 'UP' | 'DOWN'): void {
    this.localPlayerState.update((oldState) => {
      const dt = Date.now() - oldState.dyt;
      const dy = dir === 'UP' ? -oldState.sy : oldState.sy;
      const newState = {
        ...oldState,
        y: oldState.y + dy,
        sy: (GameConfig.player.moveSpeed * GameConfig.player.moveAcc) / dt,
        dyt: Date.now(),
      };
      // send to other player
      try {
        this.p2pService.sendMessage({
          event: MESSAGE_EVENTS.move_player,
          data: { y: newState.y },
        });
      } catch (err) {
        console.error(err);
      }
      return newState;
    });
  }

  updateRemotePlayer(message: Message<{ y: number }>): void {
    this.remotePlayerState.update((x) => ({ ...x, ...message.data }));
  }

  tick(
    delta: number | undefined,
    p1: PIXI.Sprite | null,
    p2: PIXI.Sprite | null,
    ball: PIXI.Sprite | null,
    border: PIXI.Graphics | null,
    countdown: number | undefined,
  ): void {
    if (
      this.gameState.getValue().step === GAME_STEP.PLAYING &&
      countdown != null &&
      countdown <= 0 &&
      delta &&
      p1 &&
      p2 &&
      ball &&
      border &&
      !this.pause
    ) {
      if (checkIfObjectInCanvas(ball)) {
        this.ballState.update((prevState) =>
          ballUpdate(prevState, delta, p1, p2, ball, border),
        );
      } else {
        this.pause = true;

        const scoreIdx = +!(
          ball.x + ball.width / 2 >
          GameConfig.screen.width - GameConfig.screen.padding
        );
        console.log('SCORE!');
        this.gameState.update((oldGameState: GameState) => {
          const newState = Object.assign({}, oldGameState) as GameState;
          newState.score[scoreIdx]++;
          return newState;
        });

        setTimeout(() => {
          this.resetRound();
          this.pause = false;
        }, 2000);
      }
    }
  }
}
