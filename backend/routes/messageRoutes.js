import express from 'express';
import {
  sendMessage,
  getMessageHistory,
  getUsers,
  createUser,
  markMessagesAsRead,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.post('/send', sendMessage);
router.put('/mark-read/:user', markMessagesAsRead);
router.get('/history/:user', getMessageHistory);

export default router;
