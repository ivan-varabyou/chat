import { computed } from '@angular/core';
import { SignalState } from '@ngrx/signals';
import {
  ChatState,
  ChatStatus,
  PrivateMessage,
  RoomMessage,
} from './chat.models';

export const computedChat = (store: SignalState<ChatState>) => ({
  currentChatPartner: computed(() => {
    const currentRoom = store.currentRoom();
    if (currentRoom.startsWith('private_')) {
      // private_{{sender}}_{{to}}
      // The login user is user01, and the chat name with user02 is Private_user01_user02.
      // The message notification on the left is Private_user02_user01, the chat name on the right is Private_user01_user02, so you need to define the sender and
      const [, sender, to] = currentRoom.split('_');
      const partnerUsername =
        sender === store.userInfo()?.username ? to : sender;
      const user = store
        .users()
        .find((user) => user.username === partnerUsername);
      return user;
    }

    if (currentRoom === 'general') {
      return { username: 'general', status: 'online' };
    }

    return null;
  }),

  onlineUsers: computed(() =>
    store.users().filter((user) => user.status === ChatStatus.online)
  ),
  offlineUsers: computed(() =>
    store.users().filter((user) => user.status === ChatStatus.offline)
  ),
  messageNotifications: computed(() => {
    const generalUnreadCount = store.unreadCounts()['general'] || 0;
    const generalLastMessage = store
      .generalMessages()
      .filter((msg) => !msg.isRecalled)
      .slice(-1)[0];

    let privateUnreadCount = store.users().map(({ username, status }) => {
      const room = `private_${store.userInfo()?.username}_${username}`;
      let unreadCount = store.unreadCounts()[room] || 0;
      let lastMessage: PrivateMessage = store
        .privateMessages()
        .filter((msg) => msg.room === room && !msg.isRecalled)
        .slice(-1)[0];
      return { username, room, status, unreadCount, lastMessage };
    });

    privateUnreadCount = privateUnreadCount.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.date).getTime() -
        new Date(a.lastMessage.date).getTime()
      );
    });

    return {
      general: {
        room: 'general',
        unreadCount: generalUnreadCount,
        lastMessage: generalLastMessage || { message: '', data: '' },
      },
      private: privateUnreadCount,
    };
  }),

  allUnreadCount: computed(() => {
    const users = store.users();
    const userInfo = store.userInfo();
    const unreadCount = store.unreadCounts();

    const generalUnreadCount = unreadCount['general'] || 0;
    const privateUnreadCount = users.reduce((acc, user) => {
      const room = `private_${user.username}_${userInfo?.username}`;
      const count = unreadCount[room] || 0;
      return acc + count;
    }, 0);
    return generalUnreadCount + privateUnreadCount;
  }),

  currentChatMessages: computed(() => {
    const currentRoom = store.currentRoom();

    // general
    if (currentRoom === 'general') {
      const generelMessages = store.generalMessages() || [];
      const roomMessage = generelMessages.map((msg) => {
        return msg.replyToMessage
          ? () => {
              const replyToMessage = generelMessages.find(
                (m) => m.id === msg.replyToMessageId
              );
              return { ...msg, replyToMessage };
            }
          : msg;
      });
      return roomMessage as RoomMessage[];
    }

    // private_{{sender}}_{{to}}
    const privateMessage =
      [...store.privateMessages().filter((msg) => msg.room === currentRoom)] ||
      [];

    const roomMessage = privateMessage.map((msg) => {
      return msg.replyToMessage
        ? () => {
            const replyToMessage = privateMessage.find(
              (m) => m.id === msg.replyToMessageId
            );
            return { ...msg, replyToMessage };
          }
        : msg;
    });
    return roomMessage as RoomMessage[];
  }),
});
