import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from '../../socket';
import ACTIONS from '../../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {


    const socketRef = useRef(null);
        const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();


    const [clients, setClients] = useState([])



    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket()

            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }





            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });




            //Listening for joined events
            socketRef.current.on(
                ACTIONS.JOINED,
                ({clients,username,socketId})=>{
                    if(username !== location.state?.username){
                        toast.success(`${username} joined the room`)
                        console.log(`${username} joined` )
                    }

                    setClients(clients)
                       socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            )




 // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );



        }
        init()
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, [])

  async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }


     function leaveRoom() {
        reactNavigator('/');
    }



    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className='MainWrapper h-screen grid [grid-template-columns:230px_1fr]'>
            <div className="aside bg-[#1c1e29] p-4 text-white flex flex-col">
                <div className="asideinner flex-1">
                    <div className=" border-b border-[#424242] pb-2.5">
                        <img className='h-[60px]' src="/code-sync.png" alt="" />
                    </div>
                    <h3>Connected</h3>
                    <div className="ClientsList flex items-center flex-wrap gap-5">
                        {
                            clients.map((client) => (
                                <Client key={client.socketId} username={client.username} />
                            ))
                        }
                    </div>
                </div>
                <button onClick={copyRoomId} className="border-0 px-4 py-2 rounded-md text-base font-bold cursor-pointer transition-all duration-300 ease-in-out w-[90%] bg-white text-gray-700 hover:bg-[#f2f2f2bf] mb-[20px] ">
                    COPY ROOM ID
                </button>



                <button onClick={leaveRoom} className="border-0 px-4 py-2 rounded-md text-base font-bold cursor-pointer transition-all duration-300 ease-in-out w-[90%] bg-[#46d37c] hover:bg-[#2b824c]">
                    LEAVE
                </button>

            </div>
            <div className="editorWrap w-full h-full">
                <Editor  socketRef={socketRef}    
                   roomId={roomId} 
                     onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                   />
            </div>


        </div>
    )
}

export default EditorPage
