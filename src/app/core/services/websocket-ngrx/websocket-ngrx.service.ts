import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  EventType,
  SocketState,
  SubscriptionEvent,
  SubscriptionMessage,
  WsConfig,
  WsMessage,
  WsMessageContent,
} from './websocket-ngrx.models';
import { WEBSOCKET_CONFIG } from '../websocket/websocket.tocken';
import { SocketStatsStore } from './socket-stats-store.services';
import {
  catchError,
  combineLatest,
  EMPTY,
  exhaustMap,
  filter,
  finalize,
  map,
  Observable,
  queue,
  Subject,
  switchMap,
  takeWhile,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import { state } from '@angular/animations';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { assertDefined } from '../../utils/assert/assert';

@Injectable({ providedIn: 'root' })
export class WebsocketNgrxService extends ComponentStore<
  SocketState & WsConfig
> {
  private messages = new Subject<WsMessageContent>();

  private readonly connected = new Subject<void>();

  private readonly baseUrl$ = this.select((state) => state.baseUrl);
  private readonly wsSubjectConfig$ = this.select(
    ({ wsSubjectConfig }) => wsSubjectConfig
  );
  /**
   * A stream of errors that occurred when trying to connect to the websocket.
   */
  private readonly connectError$ = this.select(
    ({ connectError }) => connectError
  );
  private readonly socket$ = this.select(({ socket }) => socket);
  private readonly subscribeUnsubscribeMessages$ = this.select(
    ({ subscribeUnsubscribeMessages }) => subscribeUnsubscribeMessages
  );

  /**
   * A stream of messages received
   */
  private readonly messages$ = this.messages.asObservable();

  /**
   * A stream that emits whenever the websocket connects.
   */
  private readonly connected$ = this.connected.asObservable();

  /**
   * The current state of the websocket connection.
   */
  private readonly isConnected$ = this.statStore.isConnected$;

  /**
   * Constructs the WebSocketSubjectConfig object, with open and close observers to handle connection status,
   * and trying to re-connect when disconnected.
   */

  private readonly debugMode = (msg: string, ...args: any): void => {
    if (this.wsConfig.debugMode) {
      console.log(msg, ...args);
    }
  };

  private readonly toSend$ = combineLatest([
    this.isConnected$,
    this.subscribeUnsubscribeMessages$,
  ]).pipe(
    filter(([isConnected, queue]) => isConnected && queue.length > 0),
    map(([, queue]) => queue)
  );

  private readonly setUpWebSocketSubjectConfig = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.baseUrl$),
      tap(([, baseUrl]) => {
        const url = `${baseUrl}`;

        this.debugMode('Websocket url', url);

        const config: WebSocketSubjectConfig<WsMessage> = {
          url,
          closeObserver: {
            next: (event) => {
              this.debugMode('closeObserver', event);
              this.statStore.setConnected(false);
              this.tryReconnect();
            },
          },

          openObserver: {
            next: (event) => {
              this.debugMode('openObserver', event);
              this.statStore.setConnected(true);
              this.patchState({ connectError: undefined });

              //  Notify connected
              this.connected.next();
            },
          },
        };

        this.patchState({
          wsSubjectConfig: config,
        });
      })
    )
  );

  /**
   * Attempts to connect to the websocket.
   */
  private readonly connect = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.wsSubjectConfig$),
      switchMap(([, config]) => {
        assertDefined(config);

        // Create a new socket and listen for messages, pushing them into the messages Subject.
        const socket = new WebSocketSubject(config);
        this.patchState({
          socket,
        });
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

  /**
   * Disconnects the socket. For simulation purposes. The service will automatically try to reconnect.
   */
  private readonly disconnect = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.isConnected$, this.socket$),
      tap(([, isConnected, socket]) => {
        if (isConnected && socket) {
          socket.complete();
        }
      })
    )
  );

  /**
   * Handles attempting to reconnect to the websocket until connected or the max retries have been reached.
   */
  private readonly tryReconnect = this.effect((trigger$) =>
    trigger$.pipe(
      exhaustMap(() => {
        return timer(this.wsConfig.retrySeconds * 1000).pipe(
          withLatestFrom(this.isConnected$),
          takeWhile(([, isConnected]) => {
            if (!isConnected) {
              this.statStore.bumpConnectionRetries();
              this.debugMode(
                'Attempting re-connect to websocket - try #',
                this.statStore.reconnectionTries
              );
            }
            return (
              !isConnected &&
              this.statStore.reconnectionTries < this.wsConfig.maxRetries
            );
          }),
          tap(() => this.connect())
        );
      })
    )
  );

  /**
   * Watches the queue for changes, and when the socket exists, sends the messages in the queue.
   */
  private readonly watchQueue = this.effect(
    (queue$: Observable<WsMessageContent[]>) =>
      queue$.pipe(
        withLatestFrom(this.socket$),
        tap(([queue, socket]) => {
          if (!socket) {
            this.debugMode('No socket, not sending queue', queue);
            return;
          }
          this.debugMode('watchQueue', queue, socket);

          while (queue.length > 0) {
            const msg = queue.shift();
            assertDefined(msg);
            this.debugMode('sending queue message', msg);
            socket.next({
              event: 'suscriptions',
              data: msg,
            });

            this.patchState({ subscribeUnsubscribeMessages: queue });
          }
        })
      )
  );

  /**
   * Adds a message to the queue to send to the server to subscribe or unsubscribe to/from a notification.
   */
  private readonly queueSubscribeUnsubscribeMessage = this.effect(
    (msg$: Observable<SubscriptionMessage>) =>
      msg$.pipe(
        withLatestFrom(this.subscribeUnsubscribeMessages$),
        tap(([msg, queue]) => {
          if (msg.isSubscribe) {
            this.statStore.bumpSubscriptionCount();
          } else {
            this.statStore.dropSubscriptionCount();
          }

          this.patchState({ subscribeUnsubscribeMessages: [...queue, msg] });
        })
      )
  );

  constructor(
    @Inject(WEBSOCKET_CONFIG) private wsConfig: WsConfig,
    private statStore: SocketStatsStore
  ) {
    super({
      baseUrl: wsConfig.baseUrl,
      retrySeconds: wsConfig.retrySeconds,
      maxRetries: wsConfig.maxRetries,
      debugMode: wsConfig.debugMode,
      subscribeUnsubscribeMessages: [],
    });

    this.statStore.setConnected(false);

    this.setUpWebSocketSubjectConfig();
    this.connect();
    this.watchQueue(this.toSend$);
  }

  /**
   * Begins subscribing to a type of events or events.
   * Returns an observable that will emit when the event is received.
   * @param eventType
   * @returns
   */
  subscribeToEventType<T extends SubscriptionEvent>(
    eventType: EventType | EventType[]
  ): Observable<T> {
    return this.setUpSubscription<T>(eventType);
  }

  /**
   *
   * @param eventType
   * @returns
   */

  private setUpSubscription<T extends SubscriptionEvent>(
    eventType: EventType | EventType[]
  ): Observable<T> {
    const msg = { eventType, isSubscribe: true };
    this.queueSubscribeUnsubscribeMessage(msg);

    return this.messages$.pipe(
      map((msg) => msg as SubscriptionEvent),
      tap((msg) => {
        this.debugMode('received notification', msg);
      }),
      filter((msg) => {
        if (typeof eventType === 'string') {
          return msg.eventType === eventType;
        } else {
          return eventType.includes(msg.eventType);
        }
      }),
      map((msg) => msg as T),
      finalize(() => {
        // Caller has unsubscribed from the stream.
        // Send the message to the server to unsubscribe from the event type(s).
        const unsubscribeMessage: SubscriptionMessage = {
          ...msg,
          isSubscribe: false,
        };
        this.queueSubscribeUnsubscribeMessage(unsubscribeMessage);
      })
    );
  }
}
