import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import axios from 'axios';

const AddContact = ({ onContactAdded }) => {
  const [contactName, setContactName] = useState('');

  const handleAddContact = async () => {
    if (!contactName.trim()) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/messages/users`, {
        user: contactName,
      });
      onContactAdded(); // Refresh the user list
      setContactName('');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  return (
    <Box className="add-contact">
      <TextField
        label="New Contact Name"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddContact}
        disabled={!contactName.trim()}
      >
        Add Contact
      </Button>
    </Box>
  );
};

export default AddContact;
