import { Inject, inject, Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  of,
  share,
  Subject,
  SubscriptionLike,
  takeWhile,
} from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { WebsocketFactoryService } from './websocket-factory.services';
import {
  IWebsocketService,
  WsMessage,
  WebSocketConfig,
  WSEvent,
} from './websoket.model';
import { WEBSOCKET_CONFIG } from './websocket.tocken';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements IWebsocketService {
  private config: WebSocketSubjectConfig<WsMessage>;
  private websocketSub: SubscriptionLike;
  private statusSub: SubscriptionLike;

  private reconnection$: Observable<number> | null = null;
  private websocket$: WebSocketSubject<WsMessage> | null = null;

  private connection$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private wsMessage$: Subject<WsMessage>;

  private reconnectInterval: number;
  private reconnectAttempts: number;
  private isConnected: boolean | undefined;

  public status: Observable<boolean>;

  constructor(@Inject(WEBSOCKET_CONFIG) private wsConfig: WebSocketConfig) {
    this.wsMessage$ = new Subject<WsMessage>();
    this.reconnectInterval = wsConfig.reconnectInterval || 5000;
    this.reconnectAttempts = wsConfig.reconnectAttempts || 10;

    this.config = {
      url: wsConfig.url,
      closeObserver: {
        next: (event: CloseEvent) => {
          this.websocket$ = null;
          this.connection$.next(false);
        },
      },
      openObserver: {
        next: (event: Event) => {
          console.log('WebSocket connected!');
          this.connection$.next(true);
        },
      },
    };
    // connction status
    this.status = new Observable<boolean>().pipe(
      share(),
      distinctUntilChanged()
    );

    // run reconnect if not connection
    this.statusSub = this.status.subscribe((isConnected) => {
      this.isConnected = isConnected;
      if (
        !this.reconnection$ &&
        typeof isConnected === 'boolean' &&
        !isConnected
      ) {
        // this.reconnect()
      }
    });

    this.websocketSub = this.wsMessage$.subscribe(null, (error: ErrorEvent) =>
      console.error('WebSocket error!', error)
    );

    // start connection websocket
    this.connect();
  }

  private connect(): void {
    this.websocket$ = new WebSocketSubject(this.config);

    this.websocket$.subscribe(
      (message: WsMessage) => {
        this.wsMessage$.next(message);
      },
      (error: ErrorEvent) => {
        if (!this.websocket$) {
          // this.reconnect()
        }
      },
      () => console.log('WebSocket connection closed!')
    );
  }

  private reconnect(): void {
    this.reconnection$ = interval(this.reconnectInterval).pipe(
      takeWhile(
        (v, index) => index < this.reconnectAttempts && !this.websocket$
      )
    );

    this.reconnection$.subscribe(
      () => this.connect(),
      null,
      () => {
        this.reconnection$ = null;
        if (!this.websocket$) {
          this.wsMessage$.complete();
          this.connection$.complete();
        }
      }
    );
  }

  /*
   * on message event
   * */
  public on<T>(event: WSEvent): Observable<T | null> {
    if (event) {
      return this.wsMessage$.pipe(
        filter((message: WsMessage) => message.event === event),
        map((message: WsMessage) => message.data as T)
      );
    }
    return of(null) as Observable<T | null>;
  }

  /*
   * on message to server
   * */
  public send(event: string, data: any = {}): void {
    if (event && this.isConnected && this.websocket$) {
      this.websocket$.next(<any>JSON.stringify({ event, data }));
    } else {
      console.error('Send error!');
    }
  }
}
