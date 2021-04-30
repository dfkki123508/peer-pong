import { Controller } from 'react-spring';
import { distinctUntilChanged, map } from 'rxjs/operators';
import GameConfig from '../config/GameConfig';
import { localPlayerState$, remotePlayerState$ } from '../services/GameStore';

export class UiController {
  private static instance: UiController;

  localPlayerState = localPlayerState$;
  remotePlayerState = remotePlayerState$;
  localPlayerAnimations: Controller<{ x: number }>;
  remotePlayerAnimations: Controller<{ x: number }>;

  private constructor() {
    this.localPlayerAnimations = new Controller({
      to: { x: this.localPlayerState.getValue().x },
      config: { mass: 10, tension: 10000, friction: 50 },
    });
    this.remotePlayerAnimations = new Controller({
      to: { x: this.remotePlayerState.getValue().x },
      config: { mass: 10, tension: 10000, friction: 50 },
    });
    this.localPlayerState
      .pipe(
        map((s) => s.x),
        distinctUntilChanged(),
      )
      .subscribe((x) => {
        this.localPlayerAnimations.set({ x });
      });
    this.remotePlayerState
      .pipe(
        map((s) => s.x),
        distinctUntilChanged(),
      )
      .subscribe((x) => {
        this.remotePlayerAnimations.set({ x });
      });
  }

  static getInstance(): UiController {
    if (!UiController.instance) {
      UiController.instance = new UiController();
    }
    return UiController.instance;
  }

  bounceLocalPlayer(): void {
    this.localPlayerAnimations.start(
      this.getPlayerAnimationObject(this.localPlayerState.getValue().x),
    );
  }

  bounceRemotePlayer(): void {
    this.remotePlayerAnimations.start(
      this.getPlayerAnimationObject(this.remotePlayerState.getValue().x),
    );
  }

  private getPlayerAnimationObject(currX: number) {
    const displacement = currX > GameConfig.screen.width / 2 ? 50 : 50;
    return {
      from: { x: currX + displacement },
      to: { x: currX },
    };
  }
}
