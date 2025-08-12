// import React, { createContext, useState, useEffect } from 'react';
// import { fetchMessages, fetchUsers, sendMessage } from '../services/api';
// import { initSocket } from '../services/socket';

// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const socket = initSocket();

//     socket.on('connect', () => {
//       console.log('Connected to socket server');
//     });

//     socket.on('new-message', (message) => {
//       console.log('Received new message via socket:', message);

//       // Add message if it's for the current user
//       if (message.user === selectedUser) {
//         setMessages((prev) => [...prev, message]);
//       }
//       // Add user to list if new
//       setUsers((prev) => {
//         if (!prev.includes(message.user)) {
//           return [...prev, message.user];
//         }
//         return prev;
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [selectedUser]);

//   useEffect(() => {
//     const loadUsers = async () => {
//       setLoading(true);
//       try {
//         const { data } = await fetchUsers();
//         setUsers(data);
//         if (data.length > 0 && !selectedUser) {
//           setSelectedUser(data[0]);
//         }
//       } catch (error) {
//         console.error('Error loading users:', error);
//       }
//       setLoading(false);
//     };
//     loadUsers();
//   }, []);

//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!selectedUser) return;

//       setLoading(true);
//       try {
//         const { data } = await fetchMessages(selectedUser);
//         setMessages(data);
//       } catch (error) {
//         console.error('Error loading messages:', error);
//       }
//       setLoading(false);
//     };
//     loadMessages();
//   }, [selectedUser]);

//   const handleSendMessage = async (message) => {
//     if (!selectedUser || !message.trim()) return;

//     const newMessage = {
//       user: selectedUser,
//       message,
//       direction: 'outgoing',
//       timestamp: new Date().toISOString(),
//     };

//     // Optimistic UI update
//     setMessages((prev) => [...prev, newMessage]);

//     try {
//       await sendMessage(selectedUser, message);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       // Revert on error
//       setMessages((prev) => prev.filter((msg) => msg !== newMessage));
//     }
//   };

//   return (
//     <ChatContext.Provider
//       value={{
//         users,
//         selectedUser,
//         setSelectedUser,
//         messages,
//         loading,
//         sendMessage: handleSendMessage,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };
import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  fetchMessages,
  fetchUsers,
  sendMessage,
  markMessagesAsRead,
} from '../services/api';
import { initSocket } from '../services/socket';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Function to mark messages as read
  const markAsRead = useCallback(async (user) => {
    try {
      await markMessagesAsRead(user);
      setUnreadCounts((prev) => ({ ...prev, [user]: 0 }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  useEffect(() => {
    const socket = initSocket();

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new-message', (message) => {
      console.log('Received new message via socket:', message);

      // Update unread count
      if (message.direction === 'incoming') {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.user]: (prev[message.user] || 0) + 1,
        }));
      }

      // Add message if it's for the current user
      if (message.user === selectedUser) {
        setMessages((prev) => [...prev, message]);
      }

      // Add user to list if new
      setUsers((prev) => {
        if (!prev.some((u) => u.user === message.user)) {
          return [...prev, { user: message.user, unreadCount: 0 }];
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

        // Initialize unread counts
        const initialCounts = {};
        data.forEach((userData) => {
          initialCounts[userData.user] = userData.unreadCount;
        });
        setUnreadCounts(initialCounts);

        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0].user);
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

        // Mark messages as read when opening chat
        if (unreadCounts[selectedUser] > 0) {
          await markAsRead(selectedUser);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
      setLoading(false);
    };
    loadMessages();
  }, [selectedUser, markAsRead]);

  const handleSendMessage = async (message) => {
    if (!selectedUser || !message.trim()) return;

    const newMessage = {
      user: selectedUser,
      message,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage]);

    try {
      await sendMessage(selectedUser, message);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg !== newMessage));
    }
  };

  // Sort users: unread first, then by most recent
  const sortedUsers = [...users].sort((a, b) => {
    // Users with unread messages first
    if (unreadCounts[a.user] > 0 && unreadCounts[b.user] === 0) return -1;
    if (unreadCounts[b.user] > 0 && unreadCounts[a.user] === 0) return 1;

    // Then by most recent message
    return 0;
  });

  return (
    <ChatContext.Provider
      value={{
        users: sortedUsers,
        selectedUser,
        setSelectedUser,
        messages,
        loading,
        unreadCounts,
        sendMessage: handleSendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
