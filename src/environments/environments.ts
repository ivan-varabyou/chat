export const environment = {
  production: true,
  apiUrl: 'https://chat-app-backend-9ma9.onrender.com/api',
  profileImageApi: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=J_',
  wsConfig: {
    baseUrl: 'wss://chat-app-backend-9ma9.onrender.com',
    retrySeconds: 5,
    maxRetries: 30,
    debugMode: true,
  },
};
