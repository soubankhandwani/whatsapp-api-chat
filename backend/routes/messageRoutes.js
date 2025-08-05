import express from 'express';
import {
  sendMessage,
  getMessageHistory,
  getUsers,
  createUser, // Make sure to import this
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.post('/send', sendMessage);
router.get('/history/:user', getMessageHistory);

export default router;
