import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import Message from './Message';
import MessageComposer from './MessageComposer';

const Chat = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedUser) {
    return (
      <div className="empty-chat">
        <h3>Select a contact to start chatting</h3>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{selectedUser}</h3>
      </div>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageComposer />
    </div>
  );
};

export default Chat;
