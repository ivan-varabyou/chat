import { TestBed } from '@angular/core/testing';

import { STORAGE, StorageService } from './storage.service';
import { fromStorage } from './from-storage.function';
import { WritableSignal } from '@angular/core';

describe('StorageService', () => {
  const key = 'theme';
  let service: StorageService;

  beforeEach(() => {
    localStorage.removeItem(key);
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: STORAGE, useValue: window.localStorage },
      ],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null', () => {
    expect(service.getItem<null>(key)).toBe(null);
  });

  it('should be get string value ', () => {
    const value = 'dark';
    service.setItem(key, value);
    expect(service.getItem<string>(key)).toBe(value);
  });
});
