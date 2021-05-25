import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil, repeatWhen, take } from 'rxjs/operators';

export class Timer {
  readonly observable$: Observable<number>;
  private readonly _stop = new Subject<void>();
  private readonly _start = new Subject<void>();

  constructor(countdownLength: number) {
    this.observable$ = timer(0, 1000).pipe(
      map((i) => countdownLength - i),
      take(countdownLength + 1),
      takeUntil(this._stop),
      repeatWhen(() => this._start),
    );
  }

  start(): void {
    this._start.next();
  }

  stop(): void {
    this._stop.next();
  }
}
