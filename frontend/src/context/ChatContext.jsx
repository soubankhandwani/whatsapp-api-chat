import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { messagesAPI } from "@/services/api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const selectedUserRef = useRef(selectedUser);

  // Keep ref in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Load users
  useEffect(() => {
    if (!authUser) return;
    setLoading(true);
    messagesAPI
      .getUsers()
      .then((res) => {
        setUsers(res.data);
        const counts = {};
        res.data.forEach((u) => {
          counts[u.user] = u.unreadCount || 0;
        });
        setUnreadCounts(counts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authUser]);

  // Socket connection
  useEffect(() => {
    if (!authUser) return;

    const socket = connectSocket();

    socket.on("new-message", (message) => {
      // Skip outgoing messages — sender already handles via optimistic update + API response
      if (message.direction === "outgoing") return;

      // Update unread if not currently viewing that user
      if (message.user !== selectedUserRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.user]: (prev[message.user] || 0) + 1,
        }));
      }

      // Add message if from selected user
      if (message.user === selectedUserRef.current) {
        setMessages((prev) => {
          // Deduplicate by _id or whatsappMessageId
          if (message._id && prev.some((m) => m._id === message._id))
            return prev;
          return [...prev, message];
        });
      }

      // Update user list
      setUsers((prev) => {
        const exists = prev.find((u) => u.user === message.user);
        if (exists) {
          return prev.map((u) =>
            u.user === message.user
              ? {
                  ...u,
                  lastMessageAt: message.createdAt || new Date().toISOString(),
                  lastMessage: message.message,
                }
              : u,
          );
        }
        return [
          {
            user: message.user,
            unreadCount: 1,
            lastMessageAt: new Date().toISOString(),
            lastMessage: message.message,
          },
          ...prev,
        ];
      });
    });

    socket.on("message-status", ({ whatsappMessageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.whatsappMessageId === whatsappMessageId ? { ...m, status } : m,
        ),
      );
    });

    return () => {
      disconnectSocket();
    };
  }, [authUser]);

  // Load messages when selecting a user
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    setLoading(true);
    messagesAPI
      .getHistory(selectedUser)
      .then((res) => {
        setMessages(res.data);
        if (unreadCounts[selectedUser] > 0) {
          messagesAPI.markAsRead(selectedUser);
          setUnreadCounts((prev) => ({ ...prev, [selectedUser]: 0 }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedUser]);

  const sendMessage = useCallback(
    async (messageText) => {
      if (!selectedUser || !messageText.trim()) return;

      const optimistic = {
        _id: `temp-${Date.now()}`,
        user: selectedUser,
        message: messageText,
        direction: "outgoing",
        status: "pending",
        read: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const { data } = await messagesAPI.send(selectedUser, messageText);
        setMessages((prev) =>
          prev.map((m) => (m._id === optimistic._id ? data : m)),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === optimistic._id ? { ...m, status: "failed" } : m,
          ),
        );
      }
    },
    [selectedUser],
  );

  const createContact = useCallback(async (phoneNumber) => {
    await messagesAPI.createContact(phoneNumber);
    const res = await messagesAPI.getUsers();
    setUsers(res.data);
  }, []);

  // Sort: unread first, then by last message
  const sortedUsers = [...users].sort((a, b) => {
    const unreadA = unreadCounts[a.user] || 0;
    const unreadB = unreadCounts[b.user] || 0;
    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadB > 0 && unreadA === 0) return 1;
    return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
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
        sendMessage,
        createContact,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
