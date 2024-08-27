import { TestBed } from '@angular/core/testing';

import { WebsocketNgrxService } from './websocket-ngrx.service';

describe('WebsocketNgrxService', () => {
  let service: WebsocketNgrxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketNgrxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
