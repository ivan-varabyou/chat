import {
  webSocket,
  WebSocketSubject,
  WebSocketSubjectConfig,
} from 'rxjs/webSocket';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebsocketFactoryService {
  public webSocket<T extends MessageEvent>(
    urlConfigOrSource: string | WebSocketSubjectConfig<T>
  ): WebSocketSubject<T> {
    return webSocket(urlConfigOrSource);
  }
}
