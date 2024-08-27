import { getState, patchState } from '@ngrx/signals';
import {
  UserInfo,
  User,
  WSEvent,
  ChatType,
  ChatStatus,
  WsConfig,
} from './chat.models';
import { inject } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { initialState, SignalChatStoreAndComputed } from './chat.store';
import { WEBSOCKET_CONFIG } from '../../services/websocket/websocket.tocken';

export const methodsChat = (store: SignalChatStoreAndComputed) => {
  const ws = inject(WebsocketService);
  const wsConfig = inject(WEBSOCKET_CONFIG) as WsConfig;

  const connectWebSocket = async () => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const token = authService.getToken();
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

    const config = {
      ...wsConfig,
      baseUrl: `${wsConfig.baseUrl}?token=${token}`,
    };

    ws.connect(config);

    ws.messages$.subscribe((message) => {
      const { event, data } = message;
      switch (event) {
        case 'initializationComplete':
          console.log('initializationComplete chatStore', getState(store));
          break;
        case WSEvent.onlineUsers:
          patchState(store, {
            users: store.users().map((user) => {
              const isOnline = message.data.users.find(
                (id: string) => id === user.username
              );
              return {
                ...user,
                isSocketStable: true,
                status: isOnline ? ChatStatus.online : ChatStatus.offline,
              };
            }),
          });
          break;
        case WSEvent.messageHistory:
          if (data.room === ChatType.general) {
            patchState(store, {
              generalMessages: data.messages,
            });
          }

          if (data.room === ChatType.private) {
            patchState(store, {
              privateMessages: data.messages,
            });
          }
          break;
        case WSEvent.message:
          patchState(store, {
            generalMessages: [...store.generalMessages(), data.message],
          });
          break;
        case WSEvent.privateMessage:
          patchState(store, {
            privateMessages: [...store.privateMessages(), data.message],
          });
          break;
        case WSEvent.unreadMessages:
          patchState(store, (state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [data.room]: data.count,
            },
          }));
          break;
        case WSEvent.updateUserList:
          store.disableAutoScroll();
          patchState(store, { users: data });
          store.enableAutoScroll();
          break;

        case WSEvent.messageRecalled:
          patchState(store, {
            generalMessages: store.generalMessages().map((msg) => {
              if (msg.id === message.data.id) {
                return {
                  ...message.data,
                };
              }
              return msg;
            }),
            privateMessages: store.privateMessages().map((msg) => {
              if (
                msg.id === message.data.id &&
                msg.room === message.data.room
              ) {
                return {
                  ...message.data,
                };
              }
              return msg;
            }),
          });
          store.enableAutoScroll();
          break;
        case WSEvent.messageUndoRecalled:
          patchState(store, {
            generalMessages: store.generalMessages().map((msg) => {
              if (msg.id === message.data.id) {
                return {
                  ...message.data,
                };
              }
              return msg;
            }),
            privateMessages: store.privateMessages().map((msg) => {
              if (
                msg.id === message.data.id &&
                msg.room === message.data.room
              ) {
                return {
                  ...message.data,
                };
              }
              return msg;
            }),
          });
          store.enableAutoScroll();
          break;
        case WSEvent.privateMessageRead:
          store.disableAutoScroll();
          patchState(store, {
            privateMessages: store.privateMessages().map((msg) => {
              if (msg.room === message.data.room) {
                return {
                  ...msg,
                  isRead: true,
                };
              }
              return msg;
            }),
          });
          store.enableAutoScroll();
          break;
        case WSEvent.messagesReadByUpdated:
          store.disableAutoScroll();
          patchState(store, {
            generalMessages: store.generalMessages().map((msg) => {
              const findUpdated = message.data.find(
                (data: { id: string }) => data.id === msg.id
              );
              if (findUpdated) {
                return {
                  ...msg,
                  readBy: findUpdated.readBy,
                };
              }
              return msg;
            }),
          });
          store.enableAutoScroll();
          break;
        default:
          break;
      }
    });
  };

  const sendGeneralMessage = (message: string, replyToMessageId?: string) => {
    if (!ws.isConnected()) return;
    ws.send({
      event: WSEvent.message,
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
    ws.send({
      event: WSEvent.privateMessage,
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
    ws.send({
      event: WSEvent.markAsRead,
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
    ws.send({
      event: WSEvent.recallMessage,
      data: {
        room,
        id,
      },
    });
    store.disableAutoScroll();
  };

  const undoRecallMessage = (room: string, id: any) => {
    if (!ws.isConnected) return;
    ws.send({
      event: WSEvent.recallMessage,
      data: {
        room,
        id,
      },
    });
    store.disableAutoScroll();
  };

  const disconnectWebSocket = () => {
    ws.disconnect();
    patchState(store, initialState);
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
