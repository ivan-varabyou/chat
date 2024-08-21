import { DestroyRef } from '@angular/core';
import { StorageService } from './storage.service';
import { TestBed } from '@angular/core/testing';
import { fromStorage } from './from-storage.function';

describe(' fromStorage', () => {
  let storageService: jasmine.SpyObj<StorageService>;
  let destroyRef: jasmine.SpyObj<DestroyRef>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
    ]);
    const destroyRefSpy = jasmine.createSpyObj('DestroyRef', ['onDestroy']);

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: DestroyRef, useValue: destroyRefSpy },
      ],
    });

    destroyRef = TestBed.inject(DestroyRef) as jasmine.SpyObj<DestroyRef>;
    storageService = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
  });

  it('should initialize signal with value from stroage', () => {
    TestBed.runInInjectionContext(() => {
      const storageKey = 'testKey';
      const storedValue = 'testValue';
      storageService.getItem.and.returnValue(storedValue);
      const signal = fromStorage<string>(storageKey);
      expect(signal()).toBe(storedValue);
    });
  });

  it('should update storage when signal changes', () => {
    TestBed.runInInjectionContext(() => {
      const storageKey = 'testKey';
      const initialValue = 'initialValue';
      const newValue = 'newValue';

      storageService.getItem.and.returnValue(initialValue);

      const signal = fromStorage<string>(storageKey);
      signal.set(newValue);

      expect(signal()).toBe(newValue);
    });
  });
});
