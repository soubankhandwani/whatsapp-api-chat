import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ["websocket", "polling"],
      path: "/socket.io",
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
