export default class Keyboard {
  value: string;
  isDown: boolean;
  isUp: boolean;
  press: (() => void) | undefined;
  release: (() => void) | undefined;

  private _downListener: (event: KeyboardEvent) => void;
  private _upListener: (event: KeyboardEvent) => void;

  constructor(value: string) {
    this.value = value;
    this.isDown = false;
    this.isUp = true;
    this._downListener = this.downHandler.bind(this);
    this._upListener = this.upHandler.bind(this);
    window.addEventListener('keydown', this._downListener);
    window.addEventListener('keyup', this._upListener);
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
    window.removeEventListener('keydown', this._downListener);
    window.removeEventListener('keyup', this._upListener);
  }
}
