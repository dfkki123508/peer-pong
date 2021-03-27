import React from 'react';

interface Type<T> extends Function {
  new (...args: any[]): T;
}
interface TypeWithArgs<T, A extends any[]> extends Function {
  new (...args: A): T;
}

// TBD: Problems with importing
export function exportContextService<T>(
  clazz: Type<T>,
): {
  [x: string]: React.Context<T> | (() => T);
} {
  console.log('exporting ', clazz.name);

  const contextName = clazz.name + 'Context';
  const useContextFuncName = 'use' + clazz.name;
  const context = React.createContext(new clazz());

  const ret = {
    [contextName]: context,
    [useContextFuncName]: (): T => React.useContext(context),
  };
  console.log('Exporting:', ret);
  return ret;
}
