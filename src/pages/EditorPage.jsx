import React, { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
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

  const [clients, setClients] = useState([]);
  const [sidebarPercent, setSidebarPercent] = useState(0.2);
  const [editorPercent, setEditorPercent] = useState(0.8);
  const [output, setOutput] = useState('');
const [language, setLanguage] = useState('javascript'); // or add a select box

async function runCode() {
  const url = `${import.meta.env.VITE_BACKEND_URL}/run`;
  console.log('Fetching URL:', url); // Debug the URL
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        source: codeRef.current,
      }),
    });
    const data = await response.json();
    setOutput((data.stdout || '') + (data.stderr || ''));
  } catch (err) {
    setOutput('Error: ' + err.message);
  }
}


  // Compute initial proportions on mount
  useEffect(() => {
    const sidebar = document.querySelector('.aside');
    const editor = document.querySelector('.editorWrap');
    if (sidebar && editor) {
      const totalWidth = sidebar.offsetWidth + editor.offsetWidth;
      setSidebarPercent(sidebar.offsetWidth / totalWidth);
      setEditorPercent(editor.offsetWidth / totalWidth);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', handleErrors);
      socketRef.current.on('connect_failed', handleErrors);

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
        }
        setClients(clients);

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients(prev => prev.filter(client => client.socketId !== socketId));
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

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

  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="MainWrapper h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div
        className="aside bg-[#1c1e29] p-2 sm:p-4 text-white flex flex-col"
        style={{ width: `${sidebarPercent * 100}%`, minWidth: '150px' }}
      >
        <div className="asideinner flex-1 overflow-y-auto">
          <div className="border-b border-[#424242] pb-1 sm:pb-2.5">
            <img
              className="h-10 sm:h-[60px] w-auto mx-auto"
              src="/code-sync.png"
              alt="logo"
            />
          </div>
          <h3 className="text-sm sm:text-base mt-2">Connected</h3>
          <div className="ClientsList flex flex-wrap gap-2 sm:gap-5 mt-2">
            {clients.map(client => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <button
          onClick={copyRoomId}
          className="w-[90%] mb-2 sm:mb-4 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base font-bold bg-white text-gray-700 hover:bg-[#f2f2f2bf]"
        >
          COPY ROOM ID
        </button>

        <button
          onClick={leaveRoom}
          className="w-[90%] px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base font-bold bg-[#46d37c] hover:bg-[#2b824c]"
        >
          LEAVE
        </button>
      </div>

      {/* Editor */}
      <div
  className="editorWrap h-full flex flex-col"
  style={{ width: `${editorPercent * 100}%` }}
>
  <div className="flex-1">
    <Editor
      socketRef={socketRef}
      roomId={roomId}
      onCodeChange={code => (codeRef.current = code)}
    />
  </div>

  <div className="run-section p-2 bg-[#1c1e29] text-white">
    <div className="flex gap-2 mb-2">
      <select value={language} onChange={e => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="python3">Python 3</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>
      <button
        onClick={runCode}
        className="px-2 py-1 bg-[#46d37c] rounded hover:bg-[#2b824c]"
      >
        Run
      </button>
    </div>

    <div className="output p-2 bg-black text-green-400 h-40 overflow-auto">
      <pre>{output}</pre>
    </div>
  </div>
</div>

    </div>
  );
};

export default EditorPage;
