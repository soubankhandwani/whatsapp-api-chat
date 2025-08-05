import { io } from 'socket.io-client';

export const initSocket = () => {
  const socket = io('https://whatsapp-api-chat-fakw.onrender.com', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
    transports: ['websocket'], // Force WebSocket only
  });

  // Debugging listeners
  socket.on('connect', () => {
    console.log('Connected to backend:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
  });

  return socket;
};
