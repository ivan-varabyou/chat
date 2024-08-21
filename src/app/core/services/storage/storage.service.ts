import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';

export const STORAGE = new InjectionToken<Storage>(
  'Web Storage Injection Token'
);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  readonly #storage = inject(STORAGE);
  public getItem<T>(key: string): T | null {
    const value = this.#storage.getItem(key);
    return value === null ? null : JSON.parse(value);
  }

  public setItem<T>(key: string, value: T | null): void {
    const stringified = JSON.stringify(value);
    this.#storage.setItem(key, stringified);

    const storageEvent = new StorageEvent('storage', {
      key: key,
      newValue: stringified,
      storageArea: this.#storage,
    });

    window.dispatchEvent(storageEvent);
  }
}

export const provideStorage = (storage: Storage): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: STORAGE, useValue: storage }]);
