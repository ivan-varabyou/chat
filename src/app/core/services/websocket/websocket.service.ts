import { computed, Inject, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  EMPTY,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeWhile,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { WsMessage, SocketState, WsConfig } from './websoket.model';
import { WEBSOCKET_CONFIG } from './websocket.tocken';
import { ComponentStore } from '@ngrx/component-store';
import { SocketStatsStore } from './socket-stats-store.services';
import { assertDefined } from '../../utils/assert/assert';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService<T, W> extends ComponentStore<
  SocketState & WsConfig
> {
  public statStore = inject(SocketStatsStore);
  // select
  private readonly baseUrl$ = this.select((state) => state.baseUrl);
  private readonly retrySeconds$ = this.select((state) => state.retrySeconds);
  private readonly maxRetries$ = this.select((state) => state.maxRetries);
  private readonly wsSubjectConfig$ = this.select(
    (state) => state.wsSubjectConfig
  );
  /**
   * A stream of messages received from the websocket
   */
  private messages = new Subject<WsMessage<T>>();
  private readonly isConnected$ = this.statStore.isConnected$;
  private readonly socket$ = this.select((state) => state.socket);
  private webSocket!: WebSocketSubject<WsMessage<T>>;

  private readonly debugMode = (msg: string, ...args: any): void => {
    if (this.wsConfig.debugMode) {
      console.log(msg, ...args);
    }
  };

  public readonly messages$ = this.messages.asObservable();
  private readonly isConnectedSignal = signal(false);
  public isConnected = computed(() => this.isConnectedSignal());

  constructor(@Inject(WEBSOCKET_CONFIG) private wsConfig: WsConfig) {
    super({
      baseUrl: wsConfig.baseUrl,
      retrySeconds: wsConfig.retrySeconds || 5,
      maxRetries: wsConfig.maxRetries || 10,
      debugMode: wsConfig.debugMode || false,
    });
    this.statStore.setConnected(false);
    this.setUpWebSocketConfig();
  }

  private readonly setUpWebSocketConfig = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.baseUrl$),
      tap(([, baseUrl]) => {
        this.debugMode('Websocket baseUrl', baseUrl);

        const config: WebSocketSubjectConfig<WsMessage> = {
          url: baseUrl,
          closeObserver: {
            next: (event) => {
              this.debugMode('closeObserver', event);
              this.statStore.setConnected(false);
              this.isConnectedSignal.set(false);
              this.reconnect();
            },
          },
          openObserver: {
            next: (event) => {
              this.debugMode('openObserver', event);
              this.statStore.setConnected(true);
              this.isConnectedSignal.set(true);
              this.patchState({ connectError: undefined });
            },
          },
        };

        this.patchState({ wsSubjectConfig: config });
      })
    )
  );

  public readonly connect = (wsConfig?: WsConfig): void => {
    if (!this.webSocket) {
      if (wsConfig) {
        this.patchState({
          baseUrl: wsConfig.baseUrl,
          retrySeconds: wsConfig.retrySeconds,
          maxRetries: wsConfig.maxRetries,
          debugMode: wsConfig.debugMode,
        });
      }
      this.connectWs();
    } else {
      console.log('Already connected');
    }
  };

  private readonly connectWs = () =>
    this.effect((trigger$) =>
      trigger$.pipe(
        withLatestFrom(this.wsSubjectConfig$),
        switchMap(([, config]) => {
          assertDefined(config);

          const socket = new WebSocketSubject(config);
          this.webSocket = socket;
          this.patchState({ socket });

          return socket.pipe(
            tap((msg) => {
              this.statStore.bumpMessagesReceived();
              this.messages.next(msg);
            }),
            catchError((err) => {
              this.patchState({ connectError: err });
              this.debugMode('error in connect', err);
              return EMPTY;
            })
          );
        })
      )
    );

  private readonly reconnect = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.retrySeconds$, this.maxRetries$),
      exhaustMap(([, retrySeconds, maxRetries]) => {
        return timer(retrySeconds * 1000).pipe(
          withLatestFrom(this.isConnected$),
          takeWhile(([, isConnected]) => {
            if (!isConnected) {
              this.statStore.bumpConnectionRetries();
              this.debugMode(
                'Attempting reconnect to websocket - try',
                this.statStore.reconnectionTries
              );
            }
            return (
              !isConnected && this.statStore.reconnectionTries < maxRetries
            );
          }),
          tap(() => this.connect())
        );
      })
    )
  );

  public readonly disconnect = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.isConnected$, this.socket$),
      tap(([, isConnected, socket]) => {
        if (isConnected && socket) {
          socket.complete();
        }
      })
    )
  );

  /*
   * on message event
   * */
  public on<T>(event: string): Observable<T | null> {
    if (event) {
      return this.messages$.pipe(
        filter((message: WsMessage) => message.event === event),
        map((message: WsMessage<T>) => message.data as T)
      );
    }
    return of(null) as Observable<T | null>;
  }

  /*
   * on message to server
   * */
  public readonly send = (event: string, data: any = {}) =>
    this.effect((trigger$) =>
      trigger$.pipe(
        withLatestFrom(this.isConnected$, this.socket$),
        tap(([, isConnected, socket]) => {
          if (event && isConnected && socket) {
            this.webSocket.next(<any>JSON.stringify({ event, data }));
          } else {
            console.error('Send error!');
          }
        })
      )
    );
}
