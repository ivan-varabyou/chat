import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { WebsocketFactoryService } from './websocket-factory.services';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private wfs = inject(WebsocketFactoryService);
  private socket$!: WebSocketSubject<MessageEvent>;
  public url!: string;
  public readonly messages = signal<MessageEvent[]>([]);
  public webSocket$!: Observable<MessageEvent>;

  public connect(url: string) {
    if (!this.socket$) {
      this.url = url;
      this.socket$ = this.wfs.webSocket(url);
      this.webSocket$ = this.socket$.asObservable();
      this.socket$.subscribe({
        next: (message) =>
          this.messages.update((messages) => [...messages, message]),
        error: (error) => console.error('WebSocket error:', error),
      });
      console.log(`Successfuly connected ${url}`);
    }
    return this.socket$;
  }

  public send(message: MessageEvent): void {
    this.socket$.next(message);
  }

  public close(): void {
    this.socket$.complete();
  }
}
