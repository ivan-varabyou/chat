export interface SocketStatsState {
  isConnected: boolean;
  subscriptionCount: number;
  connections: number;
  reconnectionTries: number;
  messagesReceived: number;
}
