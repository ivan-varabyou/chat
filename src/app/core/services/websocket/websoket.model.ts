import { Observable } from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

export interface IWebsocketService {
  on<T>(event: string): Observable<T | null>;
  send(event: string, data: string): void;
  status: Observable<boolean>;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface WsMessage<T = any> {
  event: string;
  data: T;
}

export interface WsConfig {
  baseUrl: string;
  retrySeconds: number;
  maxRetries: number;
  debugMode: boolean;
}

export interface SocketState {
  connectError?: unknown;
  wsSubjectConfig?: WebSocketSubjectConfig<WsMessage>;
  socket?: WebSocketSubject<WsMessage>;
}
