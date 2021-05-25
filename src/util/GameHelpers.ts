import GameConfig from '../config/GameConfig';

export function getPlayerIndexAfterScore(ball: PIXI.Sprite): number {
  return +!(
    ball.x + ball.width / 2 >
    GameConfig.screen.width - GameConfig.screen.padding
  );
}
