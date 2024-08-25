import {
  patchState,
  SignalState,
  signalStoreFeature,
  watchState,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AutoScrollState } from './autoscroll.model';
import { computed } from '@angular/core';

const initialState: AutoScrollState = {
  autoScroll: false,
};

const computedAutoScroll = (store: SignalState<AutoScrollState>) => ({
  isAutoScrollEnabled: computed(() => store.autoScroll()),
});

const methodsAutoScroll = (store: SignalState<AutoScrollState>) => ({
  enableAutoScroll: (isTimeoutSet: boolean = true) => {
    if (isTimeoutSet) {
      setTimeout(() => {
        patchState(store, { autoScroll: true });
      }, 200);
    } else {
      patchState(store, { autoScroll: true });
    }
  },
  disableAutoScroll: () => {
    patchState(store, { autoScroll: false });
  },
});

export function withAutoScroll() {
  return signalStoreFeature(
    withState<AutoScrollState>(initialState),
    withComputed((store) => ({
      ...computedAutoScroll,
    })),
    withMethods((store) => ({
      ...methodsAutoScroll,
    }))
  );
}
export type AutoscrollFeature = ReturnType<typeof computedAutoScroll> &
  ReturnType<typeof methodsAutoScroll>;
