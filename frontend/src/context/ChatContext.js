import React, { createContext, useState, useEffect } from 'react';
import { fetchMessages, fetchUsers, sendMessage } from '../services/api';
import { initSocket } from '../services/socket';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = initSocket();

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new-message', (message) => {
      console.log('Received new message via socket:', message);

      // Add message if it's for the current user
      if (message.user === selectedUser) {
        setMessages((prev) => [...prev, message]);
      }

      // Add user to list if new
      setUsers((prev) => {
        if (!prev.includes(message.user)) {
          return [...prev, message.user];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const { data } = await fetchUsers();
        setUsers(data);
        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
      setLoading(false);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser) return;

      setLoading(true);
      try {
        const { data } = await fetchMessages(selectedUser);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
      setLoading(false);
    };
    loadMessages();
  }, [selectedUser]);

  const handleSendMessage = async (message) => {
    if (!selectedUser || !message.trim()) return;

    const newMessage = {
      user: selectedUser,
      message,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage]);

    try {
      await sendMessage(selectedUser, message);
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert on error
      setMessages((prev) => prev.filter((msg) => msg !== newMessage));
    }
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        setSelectedUser,
        messages,
        loading,
        sendMessage: handleSendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
