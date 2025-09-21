import React from 'react'
import Avatar from 'react-avatar';

const Client = ({username}) => {
   return (
        <div className="client flex flex-col items-center font-bold">
            <Avatar name={username} size={50} round="14px" />
            <span className="userName mt-[10px]">{username}</span>
        </div>
    );
};


export default Client
