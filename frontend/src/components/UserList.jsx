// import React from 'react';
// import { List, ListItem, ListItemText, Avatar } from '@mui/material';
// import { FaWhatsapp } from 'react-icons/fa';

// const UserList = ({ users, selectedUser, onSelectUser }) => {
//   return (
//     <List className="user-list">
//       {users.map((user) => (
//         <ListItem
//           key={user}
//           button="true"
//           selected={selectedUser === user}
//           onClick={() => onSelectUser(user)}
//         >
//           <Avatar>
//             <FaWhatsapp />
//           </Avatar>
//           <ListItemText primary={user} />
//         </ListItem>
//       ))}
//     </List>
//   );
// };

// export default UserList;
import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { List, ListItem, ListItemText, Avatar, Badge } from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';

const UserList = () => {
  const { users, selectedUser, setSelectedUser, unreadCounts } =
    useContext(ChatContext);

  return (
    <List className="user-list">
      {users.map((userData) => {
        const user = userData.user;

        const unread = unreadCounts[user] || 0;
        return (
          <ListItem
            key={user}
            button="true"
            selected={selectedUser === user}
            onClick={() => setSelectedUser(user)}
            style={{
              backgroundColor: unread > 0 ? '#e8f4f8' : 'inherit',
              borderLeft: unread > 0 ? '3px solid #25D366' : 'none',
            }}
          >
            <Badge
              badgeContent={unread}
              color="primary"
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Avatar>
                <FaWhatsapp />
              </Avatar>
            </Badge>
            <ListItemText
              primary={user}
              primaryTypographyProps={{
                fontWeight: unread > 0 ? 'bold' : 'normal',
                color: unread > 0 ? '#000' : 'inherit',
              }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default UserList;
