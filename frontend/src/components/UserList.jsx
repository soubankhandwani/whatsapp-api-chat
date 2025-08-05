import React from 'react';
import { List, ListItem, ListItemText, Avatar } from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';

const UserList = ({ users, selectedUser, onSelectUser }) => {
  return (
    <List className="user-list">
      {users.map((user) => (
        <ListItem
          key={user}
          button="true"
          selected={selectedUser === user}
          onClick={() => onSelectUser(user)}
        >
          <Avatar>
            <FaWhatsapp />
          </Avatar>
          <ListItemText primary={user} />
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
