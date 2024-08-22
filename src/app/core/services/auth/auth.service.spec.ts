import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { AuthData } from './auth.models';
import { API_URL } from '../api/api-url.token';
import { provideHttpClient } from '@angular/common/http';
import { STORAGE, StorageService } from '../storage/storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy = { navigate: jasmine.createSpy('navigate') };
  const apiUrl = 'http://example.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiService,
        StorageService,
        { provide: API_URL, useValue: apiUrl },
        { provide: Router, useValue: routerSpy },
        { provide: STORAGE, useValue: window.localStorage },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set token', () => {
    const mockData: AuthData = { username: 'test', password: 'test' };
    const mockResponse = { token: '111111' };
    const url = '/login';

    service.login(mockData).subscribe((data) => {
      expect(data).toEqual(mockResponse);
      expect(service.getTocken()).toEqual(mockResponse.token);
    });

    const req = httpMock.expectOne(`${apiUrl}${url}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and clear token', () => {
    service.logout();
    expect(service.getTocken()).toEqual('');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should register a new user', () => {
    const mockUser: AuthData = {
      username: 'newUser',
      password: 'newPassword',
    };

    service.register(mockUser).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should return true if user is logged in', () => {
    service.login({ username: 'test', password: 'test' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ token: '12345' });

    expect(service.isLoggedIn()).toEqual(true);
  });

  it('should return false if user is not logged in', () => {
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
