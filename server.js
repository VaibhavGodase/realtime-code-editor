import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import ACTIONS from './Actions.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://syncraft.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'https://syncraft.onrender.com'];
    console.log(`[${new Date().toISOString()}] CORS check for origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || '*');
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Log all requests and responses
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.url}: Status ${res.statusCode}, Headers: ${JSON.stringify(res.getHeaders())}`);
  });
  next();
});

// Language configuration for Piston API
const languageConfig = {
  javascript: { version: '18.15.0', fileName: 'main.js' },
  python3: { version: '3.10.0', fileName: 'main.py' },
  cpp: { version: '10.2.0', fileName: 'main.cpp' },
  java: { version: '15.0.2', fileName: 'Main.java' },
};

// Run code endpoint
app.post('/run', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /run received:`, req.body);
  const { language, source } = req.body;

  if (!language || !source) {
    console.log(`[${new Date().toISOString()}] Missing language or source`);
    return res.status(400).json({ error: 'Language and source are required' });
  }

  const config = languageConfig[language];
  if (!config) {
    console.log(`[${new Date().toISOString()}] Unsupported language: ${language}`);
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version: config.version,
        files: [
          {
            name: config.fileName,
            content: source,
          },
        ],
      }),
    });
    console.log(`[${new Date().toISOString()}] Piston API response status: ${response.status}`);
    const data = await response.json();
    console.log(`[${new Date().toISOString()}] Piston API response data:`, data);
    
    if (response.status === 429) {
      console.log(`[${new Date().toISOString()}] Rate limit exceeded`);
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait and try again.' });
    }
    
    res.json(data);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in /run:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

// Socket logic
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
}

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Socket connected:`, socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`[${new Date().toISOString()}] Listening on port ${PORT}`));