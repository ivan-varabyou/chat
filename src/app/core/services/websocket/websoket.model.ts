import { Observable } from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

export interface IWebsocketService {
  on<T>(event: WSEvent): Observable<T | null>;
  send(event: WSEvent, data: string): void;
  status: Observable<boolean>;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export const enum WSEvent {
  message = 'message',
  privateMessage = 'privateMessage',
  markAsRead = 'markAsRead',
  recallMessage = 'recallMessage',
  onlineUsers = 'onlineUsers',
  messageHistory = 'messageHistory',
  messageRecalled = 'messageRecalled',
  messageUndoRecalled = 'messageUndoRecalled',
  privateMessageRead = 'privateMessageRead',
  messagesReadByUpdated = 'messagesReadByUpdated',
  updateUserList = 'updateUserList',
  unreadMessages = 'unreadMessages',
}

export interface WsMessage<T = any> {
  event: WSEvent;
  data: T;
}

export interface WsConfig {
  baseUrl: string;
  retrySeconds: number;
  maxRetries: number;
  debugMode: boolean;
}

export interface SocketState {
  baseUrl: string;
  connectError?: unknown;
  wsSubjectConfig?: WebSocketSubjectConfig<WsMessage>;
  socket?: WebSocketSubject<WsMessage>;
}
