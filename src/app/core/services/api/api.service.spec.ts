import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { API_URL } from './api-url.token';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://example.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: API_URL, useValue: apiUrl },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform GET request', () => {
    const url = '/test';

    const dummyData = { name: 'Test data' };

    service.get(url).subscribe((data) => {
      expect(data).toEqual(dummyData);
    });

    const req = httpMock.expectOne(`${apiUrl}${url}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyData);
  });

  it('should perform POST request', () => {
    const dummyData = { name: 'Test' };
    service.post('/test', dummyData).subscribe((data) => {
      expect(data).toEqual(dummyData);
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(JSON.stringify(dummyData));
    req.flush(dummyData);
  });

  it('should perform PUT request', () => {
    const dummyData = { name: 'Test' };
    service.put('/test', dummyData).subscribe((data) => {
      expect(data).toEqual(dummyData);
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(JSON.stringify(dummyData));
    req.flush(dummyData);
  });

  it('should perform DELETE request', () => {
    service.delete('/test').subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
