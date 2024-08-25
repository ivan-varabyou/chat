import { patchState, SignalState } from '@ngrx/signals';
import {
  UserInfo,
  User,
  WSSendMessage,
  WSSendRead,
  SendEvent,
  ChatType,
} from './chat.models';
import { inject } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { WEBSOCKET_URL } from '../../services/websocket/websocket.tocken';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { initialState, SignalChatStoreAndComputed } from './chat.store';

export const methodsChat = (store: SignalChatStoreAndComputed) => {
  const ws = inject(WebsocketService);

  const connectWebSocket = async () => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const wsUrl = inject(WEBSOCKET_URL);
    const tocken = authService.getTocken();
    try {
      // Get information about user
      const userInfo = (await firstValueFrom(
        userService.getUserInfo()
      )) as UserInfo;
      patchState(store, { userInfo });
      // Get list of all users
      const users = (await firstValueFrom(userService.getUsers())) as User[];
      patchState(store, { users });
    } catch {
      console.error('Error connecting to web socket');
    }

    const socket = ws.connect(wsUrl);

    console.log('connectWebSocket Message: ', ws.message());
  };

  const disconnectWebSocket = () => {
    if (!ws.isConnected) return;
    ws.close();
  };

  const sendGeneralMessage = (message: string, replyToMessageId?: string) => {
    if (!ws.isConnected) return;
    ws.send<WSSendMessage>({
      event: SendEvent.message,
      data: {
        room: 'general',
        message: message,
        sender: store.userInfo()?.username,
        replyToMessageId: replyToMessageId,
      },
    });
  };
  const sendPrivateMessage = (message: string, replyToMessageId?: string) => {
    if (!ws.isConnected) return;
    ws.send<WSSendMessage>({
      event: SendEvent.privateMessage,
      data: {
        to: store.currentChatPartner()?.username,
        message: message,
        sender: store.userInfo()?.username,
        replyToMessageId: replyToMessageId,
      },
    });
  };

  const markAsRead = (room: string, type: ChatType) => {
    if (!ws.isConnected) return;
    ws.send<WSSendRead>({
      event: SendEvent.markAsRead,
      data: {
        room,
        type,
        reader: store.userInfo()?.username,
      },
    });
  };

  const markGeneralAsRead = () => {
    markAsRead('general', ChatType.general);
  };

  const markPrivateAsRead = (room: string) => {
    markAsRead(room, ChatType.private);
  };

  const reset = () => {
    patchState(store, initialState);
  };

  const recallMessage = (room: string, id: any) => {
    if (!ws.isConnected) return;
    ws.send<WSSendRead>({
      event: SendEvent.recallMessage,
      data: {
        room,
        id,
      },
    });
    store.disableAutoScroll();
  };

  const undoRecallMessage = (room: string, id: any) => {
    if (!ws.isConnected) return;
    ws.send<WSSendRead>({
      event: SendEvent.recallMessage,
      data: {
        room,
        id,
      },
    });
    store.disableAutoScroll();
  };

  const setCurrentRoom = (room: string) =>
    patchState(store, { currentRoom: room });

  return {
    connectWebSocket,
    disconnectWebSocket,
    setCurrentRoom,
    sendGeneralMessage,
    sendPrivateMessage,
    markGeneralAsRead,
    markPrivateAsRead,
    reset,
    recallMessage,
    undoRecallMessage,
  };
};
