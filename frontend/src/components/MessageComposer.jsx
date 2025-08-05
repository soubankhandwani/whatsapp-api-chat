import React, { useState, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { TextField, Button, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const MessageComposer = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useContext(ChatContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="message-composer">
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!message.trim()}
        endIcon={<SendIcon />}
      >
        Send
      </Button>
    </Box>
  );
};

export default MessageComposer;
