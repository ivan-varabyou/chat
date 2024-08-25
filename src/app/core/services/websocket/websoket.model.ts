import { Observable } from 'rxjs';

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

export interface WsMessage<T = string> {
  event: WSEvent;
  data: T;
}
