export default class Keyboard {
  value: string;
  isDown: boolean;
  isUp: boolean;
  press: (() => void) | undefined;
  release: (() => void) | undefined;

  constructor(value: string) {
    this.value = value;
    this.isDown = false;
    this.isUp = true;
    window.addEventListener('keydown', this.downHandler.bind(this));
    window.addEventListener('keyup', this.upHandler.bind(this));
  }

  downHandler(event: KeyboardEvent): void {
    if (event.key === this.value) {
      if (this.isUp && this.press) this.press();
      this.isDown = true;
      this.isUp = false;
      event.preventDefault();
    }
  }

  upHandler(event: KeyboardEvent): void {
    if (event.key === this.value) {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
      event.preventDefault();
    }
  }

  unsubscribe(): void {
    window.removeEventListener('keydown', this.downHandler);
    window.removeEventListener('keyup', this.upHandler);
  }
}
