// import React from 'react';
// import { format } from 'date-fns';
// import { FaUser, FaRobot } from 'react-icons/fa';

// const Message = ({ message }) => {
//   return (
//     <div className={`message ${message.direction}`}>
//       <div className="avatar">
//         {message.direction === 'incoming' ? <FaUser /> : <FaRobot />}
//       </div>
//       <div className="content">
//         <div className="text">{message.message}</div>
//         <div className="timestamp">{message.timestamp}</div>
//       </div>
//     </div>
//   );
// };

// export default Message;
import React from 'react';
import { format } from 'date-fns';
import { FaUser, FaRobot } from 'react-icons/fa';

const Message = ({ message }) => {
  return (
    <div className={`message ${message.direction}`}>
      <div className="avatar">
        {message.direction === 'incoming' ? <FaUser /> : <FaRobot />}
      </div>
      <div className="content">
        <div
          className="text"
          style={{
            backgroundColor:
              message.direction === 'incoming' && !message.read
                ? '#ffffff'
                : message.direction === 'incoming'
                ? '#f0f0f0'
                : '#dcf8c6',
            boxShadow:
              message.direction === 'incoming' && !message.read
                ? '0 1px 1px rgba(0, 0, 0, 0.1)'
                : 'none',
          }}
        >
          {message.message}
        </div>
        <div className="timestamp">
          {message.timestamp}
          {message.direction === 'incoming' && !message.read && (
            <span style={{ marginLeft: 5, color: '#25D366' }}>●</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
