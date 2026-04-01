import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socketInstance = null;

const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Reuse existing connection
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(
        process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
        {
          auth: { token: accessToken },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketInstance.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep connection alive
    };
  }, [isAuthenticated, accessToken]);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room) => {
    emit('join_conversation', { conversationId: room });
  }, [emit]);

  const leaveRoom = useCallback((room) => {
    emit('leave_conversation', { conversationId: room });
  }, [emit]);

  return {
    socket: socketRef.current,
    on,
    emit,
    joinRoom,
    leaveRoom,
    isConnected: socketRef.current?.connected || false,
  };
};

export default useSocket;
