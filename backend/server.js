import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import messageRoutes from './routes/messageRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to database
connectDB();

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/webhook', webhookRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('WhatsApp Chat Dashboard API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
