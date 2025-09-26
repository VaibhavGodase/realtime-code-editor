import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('')
  const [username, setUserName] = useState('')

  const createNewRoom = (e) => {
    e.preventDefault()
    const id = uuidv4()
    setRoomId(id)
    toast.success('Created a new room');
  }

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID & username is required');
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
  }

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="HomeWrapper bg-[#1c1e29] min-h-screen flex flex-col items-center justify-center text-[#fff] px-4">

      {/* Main content wrapper */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full flex-grow">
        
        {/* Form Box */}
        <div className="FormWrapper bg-[#282a36] p-[20px] rounded-[10px] w-full sm:w-[570px] max-w-[90%] flex flex-col md:flex-row gap-6">

          {/* Left side - Form Inputs */}
          <div className="flex-1 flex flex-col">
            <img className="h-[80px] mb-[20px]" src="/code-sync.png" alt="code-sync.png" />
            <h4 className="mt-0 mb-[20px]">Paste invitation ROOM ID</h4>
            <input
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
              type="text"
              value={roomId}
              placeholder="ROOM ID"
              className="p-[10px] text-gray-500 mb-[14px] rounded-[5px] outline-none border-none text-[16px] font-bold bg-[#eee]"
            />
            <input
              onChange={(e) => setUserName(e.target.value)}
              onKeyUp={handleInputEnter}
              value={username}
              type="text"
              placeholder="USER NAME"
              className="p-[10px] text-gray-500 mb-[14px] rounded-[5px] outline-none border-none text-[16px] font-bold bg-[#eee]"
            />
            <button
              onClick={joinRoom}
              className="border-0 px-4 py-2 rounded-md text-base font-bold cursor-pointer transition-all duration-300 ease-in-out w-24 ml-auto bg-[#4aed88] hover:bg-[#2b824c]"
            >
              JOIN
            </button>

          <span className="mx-auto mt-[20px] text-sm text-gray-300">
  If you don't have an invite then create &nbsp;
  <a
    className="text-[#4aed88] no-underline border-b border-[#4aed88] transition-all duration-300 ease-in-out hover:text-[#368654] hover:border-[#368654]"
    href="#"
    onClick={createNewRoom}
  >
    new room
  </a>
</span>

          </div>

          {/* Right side - Instructions & Usecases */}
          <div className="w-full md:w-[35%] bg-[#1e1f2b] p-[15px] rounded-[8px] text-[#ccc] text-[14px]">
            <h5 className="text-[#4aed88] font-bold mb-2">Instructions</h5>
            <p className="mb-4">
              Create a new room as the host, click "COPY ROOM ID" to share it with the guest, 
              and have the guest use that ROOM ID to join the session.
            </p>

            <h5 className="text-[#4aed88] font-bold mb-2">Usecases</h5>
            <p>
              The interviewer creates or edits a coding question in real-time, and the candidate solves it live, 
              enabling a collaborative coding session.
            </p>
          </div>

        </div>
      </div>

      {/* Footer (responsive) */}
      <footer className="w-full text-center py-2 mt-4 md:mt-0 md:fixed md:bottom-0">
        <h4>
          Built with 💛 by &nbsp;
          <a
            className="text-[#4aee88] underline hover:text-[#368654]"
            href="https://vaibhav-godase-portfolio-13.netlify.app/"
          >
            Vaibhav
          </a>
        </h4>
      </footer>
    </div>
  )
}

export default Home
