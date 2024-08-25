import {
  SignalState,
  signalStoreFeature,
  withHooks,
  withState,
  patchState,
} from '@ngrx/signals';
import { PageVisibilityState } from './page-visibility.model';

const initialState: PageVisibilityState = { isPageVisible: true };

export function withPageVisibility() {
  return signalStoreFeature(
    withState<PageVisibilityState>(initialState),
    withHooks((state) => {
      function handleVisibilityChange() {
        patchState(state, { isPageVisible: !document.hidden });
      }
      return {
        onInit() {
          document.addEventListener('visibilitychange', handleVisibilityChange);
        },
        onDestroy() {
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
          );
        },
      };
    })
  );
}
