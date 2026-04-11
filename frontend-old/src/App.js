// import React from 'react';
// import { ChatProvider } from './context/ChatContext';
// import UserList from './components/UserList';
// import Chat from './components/Chat';
// import './App.css';

// function App() {
//   return (
//     <ChatProvider>
//       <div className="app-container">
//         <div className="sidebar">
//           <h2>WhatsApp Chats</h2>
//           <UserList />
//         </div>
//         <div className="main-content">
//           <Chat />
//         </div>
//       </div>
//     </ChatProvider>
//   );
// }

// export default App;

import React, { useContext } from 'react';
import { ChatProvider, ChatContext } from './context/ChatContext';
import UserList from './components/UserList';
import Chat from './components/Chat';
import AddContact from './components/AddContact';
import './App.css';
import { fetchUsers } from './services/api';

function AppContent() {
  const { users, selectedUser, setSelectedUser } = useContext(ChatContext);

  const refreshUsers = async () => {
    // Logic to refresh the user list (e.g., re-fetch users from the API)
    const { data } = await fetchUsers();
    // users(data);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>WhatsApp Chats</h2>
        <AddContact onContactAdded={refreshUsers} />
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>
      <div className="main-content">
        <Chat />
      </div>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
