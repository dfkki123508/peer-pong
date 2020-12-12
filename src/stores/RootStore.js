import { MobXProviderContext } from 'mobx-react';
import * as React from 'react';
import { STORE_APP } from '../constants/stores';
import AppStore from './AppStore';

export class RootStore {
  constructor() {
    this.appStore = new AppStore(this);
  }

  provideStores() {
    return {
      [STORE_APP]: this.appStore,
    };
  }
}

export function useAppStore() {
  return React.useContext(MobXProviderContext)[STORE_APP];
}
