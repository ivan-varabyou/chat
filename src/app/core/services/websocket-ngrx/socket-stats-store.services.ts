import { trigger } from '@angular/animations';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap, withLatestFrom } from 'rxjs';
import { SocketStatsState } from './socket-stats-store.services.models';

@Injectable({
  providedIn: 'root',
})
export class SocketStatsStore extends ComponentStore<SocketStatsState> {
  readonly isConnected$ = this.select((state) => state.isConnected);
  readonly subscriptionCount$ = this.select((state) => state.subscriptionCount);
  readonly connections$ = this.select((state) => state.connections);
  readonly reconnectionTries$ = this.select((state) => state.reconnectionTries);
  readonly messagesReceived$ = this.select((state) => state.messagesReceived);

  readonly vw$ = this.select({
    isConnected: this.isConnected$,
    subscriptionCount: this.subscriptionCount$,
    connections: this.connections$,
    reconnectionTries: this.reconnectionTries$,
    messagesReceived: this.messagesReceived$,
  });

  get reconnectionTries() {
    return this.get().reconnectionTries;
  }

  readonly setConnected = this.effect((isConnected$: Observable<boolean>) =>
    isConnected$.pipe(
      tap((isConnected) => {
        this.patchState({ isConnected });
      })
    )
  );

  readonly bumpConnectionRetries = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.reconnectionTries$),
      tap(([, reconnectionTries]) => {
        this.patchState({ reconnectionTries: reconnectionTries + 1 });
      })
    )
  );

  readonly bumpMessagesReceived = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.messagesReceived$),
      tap(([, messagesReceived]) => {
        this.patchState({ messagesReceived: messagesReceived + 1 });
      })
    )
  );

  readonly dropSubscriptionCount = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.subscriptionCount$),
      tap(([, subscriptionCount]) => {
        this.patchState({ subscriptionCount: subscriptionCount - 1 });
      })
    )
  );

  readonly bumpSubscriptionCount = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.subscriptionCount$),
      tap(([, subscriptionCount]) => {
        this.patchState({ subscriptionCount: subscriptionCount + 1 });
      })
    )
  );

  constructor() {
    super({
      isConnected: false,
      subscriptionCount: 0,
      connections: 0,
      reconnectionTries: 0,
      messagesReceived: 0,
    });
  }
}
