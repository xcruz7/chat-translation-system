import { io } from "socket.io-client";

let socketInstance = null;

const getSocketUrl = () => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.startsWith("/")) {
    return window.location.origin;
  }

  return new URL(apiBaseUrl).origin;
};

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }

  return socketInstance;
};
