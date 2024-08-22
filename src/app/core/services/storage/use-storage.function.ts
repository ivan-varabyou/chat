import {
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
  type WritableSignal,
} from '@angular/core';
import { StorageService } from './storage.service';

export const useStorage = <T>(storageKey: string) => {
  const storage = inject(StorageService);
  const initialValue = storage.getItem<T>(storageKey);
  const fromStorageSignal = signal<T | null>(initialValue);
  const writeToStorageOnUpdateEffect = effect(() => {
    const update = fromStorageSignal();
    untracked(() => storage.setItem(storageKey, update));
  });

  const storageEventListener = (event: StorageEvent) => {
    const isWatchedCurrentStorageKey = event.key === storageKey;
    if (!isWatchedCurrentStorageKey) return;

    const currentValue = fromStorageSignal();
    const newValue = storage.getItem<T>(storageKey);

    const hasStorageValueChanged = newValue !== currentValue;
    if (hasStorageValueChanged) {
      fromStorageSignal.set(newValue);
    }
  };

  window.addEventListener('storage', storageEventListener);

  inject(DestroyRef).onDestroy(() => {
    window.removeEventListener('storage', storageEventListener);
  });

  return fromStorageSignal;
};
