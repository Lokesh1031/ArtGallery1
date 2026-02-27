import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('user-connected', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const sendMessage = (receiverId, message, artworkId = null) => {
    if (socket) {
      socket.emit('send-message', {
        receiverId,
        senderId: user.id,
        message,
        artworkId
      });
    }
  };

  const emitTyping = (receiverId) => {
    if (socket) {
      socket.emit('typing', {
        receiverId,
        senderId: user.id
      });
    }
  };

  const value = {
    socket,
    sendMessage,
    emitTyping,
    onlineUsers
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
