import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth/auth.service';
import { ApiService } from '../services/api/api.service';
import { API_URL } from '../services/api/api-url.token';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let apiService: ApiService;
  let authService: AuthService;
  const apiUrl = 'http://example.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        {
          provide: AuthService,
          useValue: {
            getTocken: jasmine.createSpy('getTocken').and.returnValue('12345'),
          },
        },
        { provide: API_URL, useValue: apiUrl },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header to requests', () => {
    apiService.get('/test').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/test`);

    expect(req.request.headers.has('authorization')).toBeTrue();
    expect(req.request.headers.get('authorization')).toBe('bear 12345');
    req.flush({});
  });

  it('should skip adding Authorization header for login and register URLs', () => {
    apiService.get(`/login`).subscribe();
    apiService.get(`/register`).subscribe();

    const loginReq = httpMock.expectOne(`${apiUrl}/login`);
    expect(loginReq.request.headers.has('authorization')).toBeFalse();
    loginReq.flush({});

    const registerReq = httpMock.expectOne(`${apiUrl}/register`);
    expect(registerReq.request.headers.has('authorization')).toBeFalse();
    registerReq.flush({});
  });

  it('should proceed without Authorization header if token is not available', () => {
    (authService.getTocken as jasmine.Spy).and.returnValue(null);
    apiService.get('/test').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.headers.has('authorization')).toBeFalse();
    req.flush({});
  });
});
