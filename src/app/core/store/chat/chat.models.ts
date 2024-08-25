import { Signal } from '@angular/core';

export interface Message {
  id: string;
  room: string;
  message: string;
  sender: string;
  date: string;
  isRecalled: boolean;
  readBy: string[];
  replyToMessageId: string;
}

export interface GeneralMessage extends Message {
  replyToMessage: GeneralMessage | null;
}

export interface PrivateMessage extends Message {
  replyToMessage: PrivateMessage | null;
}

export type RoomMessage = GeneralMessage | PrivateMessage;

export const enum ChatStatus {
  offline = 'offline',
  online = 'online',
}

export const enum ChatType {
  general = 'general',
  private = 'private',
}

export interface User {
  username: string;
  status: ChatStatus;
}

export interface UserInfo {
  username: string;
  status: ChatStatus;
  avatar: string;
}

export interface ChatState {
  isSocketStable: boolean;
  userInfo: UserInfo | null;
  currentRoom: string;
  users: User[];
  generalMessages: GeneralMessage[];
  privateMessages: PrivateMessage[];
  unreadCounts: { [room: string]: number };
}
