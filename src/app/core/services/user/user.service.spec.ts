import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from '../api/api.service';
import { API_URL } from '../api/api-url.token';

describe('UserService', () => {
  let service: UserService;
  const apiUrl = 'http://example.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        ApiService,
        { provide: API_URL, useValue: apiUrl },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
