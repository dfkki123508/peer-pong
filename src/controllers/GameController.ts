import { Observer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import GameConfig, {
  getInitialBallState,
  getInitialGameState,
  getInitialPlayerState,
} from '../config/GameConfig';
import {
  ballState$,
  countdownTimer,
  debugState$,
  gameState$,
  localPlayerState$,
  remotePlayerState$,
} from '../services/GameStore';
import MessageDispatcher from '../services/MessageDispatcher';
import { P2PServiceInstance } from '../services/P2PService';
import {
  BallState,
  DEBUG_COMMANDS,
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
  private messageDispatcher = new MessageDispatcher();

  private gameState$ = gameState$;
  private localPlayerState$ = localPlayerState$;
  private remotePlayerState$ = remotePlayerState$;
  private ballState$ = ballState$;
  private countdownTimer = countdownTimer;
  private debugState$ = debugState$;

  private masterPeer = false;
  private pause = false;

  private constructor() {
    GameController.numInstances++;
    console.log('New game controller instance ', GameController.numInstances);
    console.log('p2pservice:', this.p2pService);

    this.bindFunctions();

    this.setupMessageCallbacks();

    this.gameState$.subscribe(this.gameStateObserver);

    // On connection, switch to ready to play
    this.p2pService.conn$.subscribe((messageObservable) => {
      if (messageObservable) {
        console.log('New connection! Setting gamestate to ready-to-play...');
        gameState$.update((x) => ({
          ...x,
          step: GAME_STEP.READY_TO_PLAY,
        }));
        messageObservable.subscribe(this.messageObserver());
      }
    });

    // Connect to remote if url hash value is given
    const peerId = getHashValue('connectTo');
    if (peerId) {
      this.p2pService.peer$.subscribe(() => this.connectToRemote(peerId));
    }
  }

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  private bindFunctions() {
    this.startGame = this.startGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.startRound = this.startRound.bind(this);
    this.resetRound = this.resetRound.bind(this);
    this.updateRemotePlayer = this.updateRemotePlayer.bind(this);
    this.gameStateObserver = this.gameStateObserver.bind(this);
    this.handleBallUpdate = this.handleBallUpdate.bind(this);
    this.handleDebugCommand = this.handleDebugCommand.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
  }

  private setupMessageCallbacks() {
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.move_player,
      this.updateRemotePlayer,
    );
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.start_game,
      this.startGame,
    );
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.start_round,
      this.startRound,
    );
    this.messageDispatcher.registerCallback(MESSAGE_EVENTS.reset_round, () =>
      this.resetRound(),
    );
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.ball_update,
      this.handleBallUpdate,
    );
    this.messageDispatcher.registerCallback(
      MESSAGE_EVENTS.debug_command,
      this.handleDebugCommand,
    );
  }

  gameStateObserver(gameState: GameState): void {
    console.log('New game state!', gameState);
    // TODO: Launch fullscreen when switching to ready to play
  }

  messageObserver(): Observer<Message> {
    return {
      next: (msg) => this.messageDispatcher.dispatch(msg),
      complete: () => this.onDisconnect(),
      error: (err) => console.error(err),
    };
  }

  onDisconnect(): void {
    this.masterPeer = false;
    this.resetGame(true);
  }

  // TODO: make wrapper/decorator/pattern whatever to handle functions executed on both peers
  startGame(message?: Message<BallState>): void {
    console.log('Starting game', message);
    this.resetGame();

    // Either send or process data
    if (!message) {
      this.p2pService.sendMessage({
        event: MESSAGE_EVENTS.start_game,
        data: this.ballState$.getValue(),
      });
    } else {
      this.ballState$.next(message.data);
    }
    this.gameState$.update((oldState) => ({
      ...oldState,
      step: GAME_STEP.PLAYING,
    }));
  }

  resetGame(initStep = false): void {
    console.log('Resetting game...');
    this.gameState$.update((x) => ({
      ...x,
      score: [0, 0],
      step: initStep ? GAME_STEP.INIT : x.step,
    }));
    this.resetRound(initStep);
  }

  startRound(message?: Message<BallState>): void {
    console.log('Starting round', message);

    // Either send or process data
    if (!message) {
      this.p2pService.sendMessage({
        event: MESSAGE_EVENTS.start_round,
        data: this.ballState$.getValue(),
      });
    } else {
      this.ballState$.next(message.data);
    }
    this.countdownTimer.start();
  }

  resetRound(initPlayersSide = false, send = false): void {
    this.localPlayerState$.update((oldState) => {
      const state = getInitialPlayerState(0);
      if (!initPlayersSide) state.x = oldState.x;
      return state;
    });
    this.remotePlayerState$.update((oldState) => {
      const state = getInitialPlayerState(1);
      if (!initPlayersSide) state.x = oldState.x;
      return state;
    });

    this.ballState$.next(getInitialBallState());

    if (send) {
      this.p2pService.sendMessage({ event: MESSAGE_EVENTS.reset_round });
    }
  }

  swapPlayersSides(): void {
    let localX = this.localPlayerState$.getValue().x;
    let remoteX = this.remotePlayerState$.getValue().x;
    const copyX = remoteX;

    remoteX = localX;
    localX = copyX;

    this.localPlayerState$.update((oldState) => ({ ...oldState, x: localX }));
    this.remotePlayerState$.update((oldState) => ({ ...oldState, x: remoteX }));
  }

  connectToRemote(inputPeerId: string): void {
    this.p2pService.connect(inputPeerId); // TODO: check that peer me id is ready before
    this.swapPlayersSides();
    this.masterPeer = true; // The one who connects is the master peer
  }

  moveLocalPlayer(dir: 'UP' | 'DOWN'): void {
    this.localPlayerState$.update((oldState) => {
      const dt = Date.now() - oldState.dyt;
      const dy = dir === 'UP' ? -oldState.sy : oldState.sy;
      const newState = {
        ...oldState,
        y: oldState.y + dy,
        sy: GameConfig.player.moveSpeed + GameConfig.player.moveAcc / dt,
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
    this.remotePlayerState$.update((x) => ({ ...x, ...message.data }));
  }

  handleBallUpdate(message: Message<BallState>): void {
    this.ballState$.next(message.data);
  }

  handleDebugCommand(message: Message): void {
    console.log('Received debug comm', message);
    switch (message.data) {
      case DEBUG_COMMANDS.toggle_freeze:
        this.debugState$.update((x) => ({ freeze: !x.freeze }));
        break;
      default:
        break;
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.debugState$.getValue().freeze) {
      if (event.key === 'ArrowUp') {
        this.moveLocalPlayer('UP');
      } else if (event.key === 'ArrowDown') {
        this.moveLocalPlayer('DOWN');
      }
    }
    if (GameConfig.debug.on && event.key === ' ') {
      this.p2pService.sendMessage({
        event: MESSAGE_EVENTS.debug_command,
        data: DEBUG_COMMANDS.toggle_freeze,
      });
      this.debugState$.update((x) => ({ freeze: !x.freeze }));
    }
  }

  finishConditionReached(gameState: GameState): boolean {
    return (
      gameState.step != GAME_STEP.FINISHED &&
      Math.max(...gameState.score) >= GameConfig.game.finishScore
    );
  }

  tick(
    delta: number | undefined,
    localPlayer: PIXI.Sprite | null,
    remotePlayer: PIXI.Sprite | null,
    ball: PIXI.Sprite | null,
    border: PIXI.Graphics | null,
    countdown: number | undefined,
  ): void {
    if (
      this.gameState$.getValue().step === GAME_STEP.PLAYING &&
      countdown != null &&
      countdown <= 0 &&
      delta &&
      localPlayer &&
      remotePlayer &&
      ball &&
      border &&
      !this.pause &&
      !this.debugState$.getValue().freeze
    ) {
      if (checkIfObjectInCanvas(ball)) {
        this.ballState$.update((prevState) => {
          const [newState, localPlayerCollision] = ballUpdate(
            prevState,
            delta,
            localPlayer,
            remotePlayer,
            ball,
            border,
          );
          if (localPlayerCollision) {
            this.p2pService.sendMessage({
              event: MESSAGE_EVENTS.ball_update,
              data: newState,
            });
          }
          return newState;
        });
      } else {
        this.pause = true;

        const scoreIdx = +!(
          ball.x + ball.width / 2 >
          GameConfig.screen.width - GameConfig.screen.padding
        );
        console.log('SCORE!');
        this.gameState$.update((oldGameState: GameState) => {
          const newState = Object.assign({}, oldGameState) as GameState;
          newState.score[scoreIdx]++;
          if (this.finishConditionReached(newState)) {
            newState.step = GAME_STEP.FINISHED;
          }
          return newState;
        });

        setTimeout(() => {
          this.resetRound();
          // Only one player needs to reset ball and send update to other
          if (this.masterPeer) this.startRound();
          this.pause = false;
        }, 2000);
      }
    }
  }
}
