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
        <div className="text">{message.message}</div>
        <div className="timestamp">{message.timestamp}</div>
      </div>
    </div>
  );
};

export default Message;
