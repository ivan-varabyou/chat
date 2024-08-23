import { TestBed } from '@angular/core/testing';
import { WebsocketService } from './websocket.service';

import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Observer, of, throwError } from 'rxjs';
import { WebsocketFactoryService } from './websocket-factory.services';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let factoryService: jasmine.SpyObj<WebsocketFactoryService>;
  let mockSocket$: jasmine.SpyObj<WebSocketSubject<MessageEvent>>;

  beforeEach(() => {
    const factorySpy = jasmine.createSpyObj('WebsocketFactoryService', [
      'webSocket',
    ]);
    const socketSpy = jasmine.createSpyObj('WebSocketSubject', [
      'subscribe',
      'next',
      'complete',
      'asObservable',
    ]);

    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        { provide: WebsocketFactoryService, useValue: factorySpy },
      ],
    });

    service = TestBed.inject(WebsocketService);
    factoryService = TestBed.inject(
      WebsocketFactoryService
    ) as jasmine.SpyObj<WebsocketFactoryService>;
    mockSocket$ = socketSpy;

    factoryService.webSocket.and.returnValue(mockSocket$);
    mockSocket$.asObservable.and.returnValue(of());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to WebSocket', () => {
    const url = 'ws://test-url';
    service.connect(url);
    expect(factoryService.webSocket).toHaveBeenCalledWith(url);
    expect(mockSocket$.subscribe).toHaveBeenCalled();
  });

  it('should handle incoming messages', () => {
    const message = new MessageEvent('message', { data: 'test' });
    mockSocket$.subscribe.and.callFake(({ next }: any) => next(message));
    service.connect('ws://test-url');
    expect(service.messages()).toContain(message);
  });

  it('should send messages', () => {
    const message = new MessageEvent('message', { data: 'test' });
    service.connect('ws://test-url');
    service.send(message);
    expect(mockSocket$.next).toHaveBeenCalledWith(message);
  });

  it('should close the WebSocket connection', () => {
    service.connect('ws://test-url');
    service.close();
    expect(mockSocket$.complete).toHaveBeenCalled();
  });
});
