import { computed, effect, Injectable, signal } from '@angular/core';
import { View } from './view.models';
import {
  BehaviorSubject,
  debounceTime,
  fromEvent,
  Observable,
  pairwise,
  startWith,
  Subscription,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  private readonly startView: View = View.chatList;
  private _currentViewSignal = signal<View>(this.startView);
  private _currentView$ = new BehaviorSubject<View>(this.startView);
  private previosView!: View;

  currentViewUpdateEffect = effect(() => {
    this._currentView$.next(this._currentViewSignal());
  });

  resizeObservable$!: Observable<Event>;
  resizeSubscription!: Subscription;

  innerWith = signal(window.innerWidth);
  get isRealMobile() {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );
  }
  isMobile = computed(() => {
    const isSmallScreen = this.innerWith() < 768;
    return this.isRealMobile || isSmallScreen;
  });

  mobileUpdateEffect = effect(
    () => {
      if (this.isMobile()) {
        this.goToFriendList();
      }
    },
    {
      allowSignalWrites: true,
    }
  );

  currentView$ = this._currentView$
    .asObservable()
    .pipe(startWith(this.startView), pairwise());

  constructor() {
    this.currentView$.subscribe(([prev, curr]) => {
      this.previosView = prev;
    });

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable$
      .pipe(debounceTime(200))
      .subscribe((e: Event) => {
        this.innerWith.set((e.target as Window).innerWidth);
      });
  }

  getCurrentView$() {
    this._currentView$.asObservable;
  }

  currentView() {
    return this._currentViewSignal();
  }

  goToChatList() {
    this._currentViewSignal.set(View.chatList);
  }

  goToChatWindow() {
    this._currentViewSignal.set(View.chatWindow);
  }

  goToFriendList() {
    this._currentViewSignal.set(View.friendList);
  }

  goBack() {
    this._currentViewSignal.set(this.previosView);
  }

  resetScrol(ms = 200) {
    setTimeout(() => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, ms);
  }
}
