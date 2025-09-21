import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
  return (
    <div className="client flex flex-col items-center font-bold text-xs sm:text-sm">
      <Avatar name={username} size={30} round="10px" className="sm:h-12 sm:w-12" />
      <span className="userName mt-1 sm:mt-2">{username}</span>
    </div>
  );
};

export default Client;
