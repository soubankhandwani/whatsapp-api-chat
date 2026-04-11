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

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/env.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();
const server = createServer(app);

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, "Blocked by CORS");
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io",
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
});
app.set("io", io);

// Parse cookies
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Body parsing — capture raw body for webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Trust proxy (needed behind Nginx for correct IP, secure cookies)
app.set("trust proxy", 1);

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/webhook", webhookRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "WhatsApp Chat API" });
});

// Centralized error handler (must be last)
app.use(errorHandler);

// Socket.IO connections
io.on("connection", (socket) => {
  logger.info(
    { socketId: socket.id, origin: socket.handshake.headers.origin },
    "Client connected",
  );

  socket.on("disconnect", (reason) => {
    logger.info({ socketId: socket.id, reason }, "Client disconnected");
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info({ signal }, "Shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  // Force shutdown after 10s
  setTimeout(() => process.exit(1), 10000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
server.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, "Server started");
});
