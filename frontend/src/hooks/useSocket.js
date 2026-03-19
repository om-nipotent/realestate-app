import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

const getSocket = (token) => {
  if (!socketInstance && token) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || '/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * useSocket — connects to the server Socket.io instance.
 * @param {string|null} token — JWT token from localStorage
 * @param {Object} handlers — event handlers { onNotification, onConnect, onDisconnect }
 */
const useSocket = (token, handlers = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref updated without re-running the effect
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => {
      handlersRef.current.onConnect?.();
    };

    const onDisconnect = (reason) => {
      handlersRef.current.onDisconnect?.(reason);
    };

    const onNotification = (data) => {
      handlersRef.current.onNotification?.(data);
    };

    const onConnectError = (err) => {
      console.warn('Socket connection error:', err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
      socket.off('connect_error', onConnectError);
    };
  }, [token]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    isConnected: socketRef.current?.connected ?? false,
  };
};

export default useSocket;
