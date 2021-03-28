import { useState, useEffect } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';

export const useObservable = <T>(observable: Observable<T>): T | undefined => {
  const [state, setState] = useState<T>();

  useEffect(() => {
    const sub = observable.subscribe(setState);
    return () => sub.unsubscribe();
  }, [observable]);

  return state;
};

export const useSharedState = <T>(
  subject: BehaviorSubject<T>,
): [T, (state: T) => void] => {
  const [value, setState] = useState<T>(subject.getValue());

  useEffect(() => {
    const sub = subject.pipe(skip(1)).subscribe((s) => setState(s));
    return () => sub.unsubscribe();
  }, [subject]);

  const newSetState = (state: T) => subject.next(state);
  return [value, newSetState];
};
