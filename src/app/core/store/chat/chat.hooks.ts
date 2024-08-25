import { getState, SignalState, withHooks } from '@ngrx/signals';
import { ChatState } from './chat.models';
import { effect } from '@angular/core';

export const hooksChat = (state: SignalState<ChatState>) =>
  withHooks({
    onInit(store) {
      console.log('Store initialized', getState(store));
      effect(() => {
        const chatStore = getState(store);
        console.log('ChatStore updated', chatStore);
      });
    },
    onDestroy(store) {
      console.log('Store destroyed');
    },
  });
