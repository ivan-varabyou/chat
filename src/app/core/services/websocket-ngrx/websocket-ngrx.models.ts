import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

export type EventType = 'message' | 'connect' | 'disconnect';

export interface WsMessageContent {}

export interface WsMessage {
  event: string;
  data: WsMessageContent;
}

export interface SubscriptionMessage extends WsMessageContent {
  eventType: EventType | EventType[];
  isSubscribe: boolean;
}

export interface SubscriptionEvent<TBody = unknown> extends WsMessageContent {
  eventType: EventType;
  body: TBody;
}

export interface WsConfig {
  baseUrl: string;
  retrySeconds: number;
  maxRetries: number;
  debugMode: boolean;
}

export interface SocketState {
  baseUrl: string;
  subscribeUnsubscribeMessages: WsMessageContent[];
  wsSubjectConfig?: WebSocketSubjectConfig<WsMessage>;
  socket?: WebSocketSubject<WsMessage>;
  connectError?: unknown;
}
