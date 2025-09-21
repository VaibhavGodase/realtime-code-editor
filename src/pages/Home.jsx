import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
const[roomId , setRoomId] = useState('')
const[username , setUserName] = useState('')


const createNewRoom = (e)=>{
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

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };


  const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className='HomeWrapper bg-[#1c1e29] h-screen flex items-center justify-center flex-col  text-[#fff]'>
            <div className='FormWrapper bg-[#282a36] p-[20px] rounded-[10px] w-[400px] max-w-[90%]'>
                <img className='h-[80px] mb-[30px]' src='/code-sync.png' alt="code-sync.png" />
                <h4 className='mt-0 mb-[20px] '>Paste invitation ROOM ID</h4>
                <div className='flex flex-col'>
                    <input onChange={(e)=>{setRoomId(e.target.value)}}  onKeyUp={handleInputEnter}  type="text" value={roomId} placeholder='ROOM ID' className='p-[10px] text-gray-500 mb-[14px] rounded-[5px] outline-none border-none text-[16px] font-bold bg-[#eee]' />
                    <input onChange={(e)=>{setUserName(e.target.value)}}  onKeyUp={handleInputEnter} value={username} type="text" placeholder='USER NAME' className='p-[10px] text-gray-500  mb-[14px] rounded-[5px] outline-none border-none text-[16px] font-bold bg-[#eee]' />
                    <button onClick={joinRoom} className="border-0 px-4 py-2 rounded-md text-base font-bold cursor-pointer transition-all duration-300 ease-in-out w-24 ml-auto bg-[#4aed88] hover:bg-[#2b824c]">JOIN</button>

                    <span  className='mx-auto mt-[20px]'>
                        If you don't have an invite then create &nbsp; <a className='text-[#4aed88] no-underline border-b border-[#4aed88] transition-all duration-300 ease-in-out hover:text-[#368654] hover:border-[#368654]' href="" onClick={createNewRoom} >new room </a>
                    </span>

                </div>
            </div>
           <footer className='fixed bottom-0 '>
             <h4>
                    Built with 💛 &nbsp; by &nbsp;
                    <a className='text-[#4aee88] underline hover:text-[#368654] hover:border-[#368654]' href="https://vaibhav-godase-portfolio-13.netlify.app/">Vaibhav </a>
                </h4>
           </footer>
        </div>
    )
}

export default Home
