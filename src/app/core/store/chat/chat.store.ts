import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  SignalState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { ChatState } from './chat.models';
import { computedChat } from './chat.computed';
import { methodsChat } from './chat.methods';
import { hooksChat } from './chat.hooks';
import {
  AutoscrollFeature,
  withAutoScroll,
} from '../feature/autoscroll/autoscroll.store';
import { withPageVisibility } from '../feature/page-visibility/page-visibility.store';

export type SignalChatStoreAndComputed = SignalState<ChatState> &
  ReturnType<typeof computedChat> &
  AutoscrollFeature;

export const initialState: ChatState = {
  isSocketStable: false,
  userInfo: null,
  currentRoom: '',
  users: [],
  generalMessages: [],
  privateMessages: [],
  unreadCounts: {}, // Used to store the number of unread messages for each chat room.
};

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withDevtools('ng-chat-app'),
  withState<ChatState>(initialState),
  withAutoScroll(),
  withPageVisibility(),
  withComputed((store) => ({
    ...computedChat,
  })),

  withMethods((store) => ({
    ...methodsChat,
  })),

  withHooks((store) => ({
    ...hooksChat,
  }))
);
