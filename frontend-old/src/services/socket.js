import { io } from 'socket.io-client';

export const initSocket = () => {
  const socket = io('https://chat-api.digitaluniversity.net.in', {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    transports: ['websocket'], // Force WebSocket only
    path: '/socket.io', // Must match backend
    withCredentials: true,
    secure: true,
    autoConnect: true,
  });

  // Debugging listeners
  socket.on('connect', () => {
    console.log('✅ Connected to backend via WebSocket');
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Disconnected:', reason);
  });

  socket.on('error', (err) => {
    console.error('🔴 Socket error:', err);
  });

  return socket;
};
