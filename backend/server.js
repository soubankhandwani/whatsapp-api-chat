// import express from 'express';
// import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import connectDB from './config/db.js';
// import messageRoutes from './routes/messageRoutes.js';
// import webhookRoutes from './routes/webhookRoutes.js';
// import cors from 'cors';
// import bodyParser from 'body-parser';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });
// app.set('io', io);
// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// // Connect to database
// connectDB();

// // Routes
// app.use('/api/messages', messageRoutes);
// app.use('/api/webhook', webhookRoutes);

// // Test route
// app.get('/', (req, res) => {
//   res.send('WhatsApp Chat Dashboard API is running...');
// });

// // Socket.io connection
// io.on('connection', (socket) => {
//   console.log(`⚡ Client connected: ${socket.id}`);
//   socket.on('disconnect', () => {
//     console.log(`🔌 Client disconnected: ${socket.id}`);
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import messageRoutes from './routes/messageRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const server = createServer(app);

// Allow localhost frontend
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
  'https://whatsapp-api-chat-fakw.onrender.com', // Your Render backend
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io', // Explicit path
  transports: ['websocket', 'polling'], // Enable both
  pingInterval: 25000, // Increase ping interval
  pingTimeout: 60000, // Increase timeout
});

// Attach io to app for access in controllers
app.set('io', io);

// Middleware
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/webhook', webhookRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('WhatsApp Chat Dashboard API is running...');
});

// Health check for Render.com
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    websocket: io.engine.clientsCount > 0,
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(
    `⚡ Client connected: ${socket.id} from ${socket.handshake.headers.origin}`
  );

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `🌐 WebSocket available at wss://whatsapp-api-chat-fakw.onrender.com`
  );
});
