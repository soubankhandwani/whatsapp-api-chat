import Message from '../models/Message.js';
import { sendTextMessage } from '../services/whatsappService.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await sendTextMessage(to, message);

    const newMessage = new Message({
      user: to,
      message,
      direction: 'outgoing',
    });

    await newMessage.save();

    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get message history for a user
export const getMessageHistory = async (req, res) => {
  try {
    const { user } = req.params;
    const messages = await Message.find({ user }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
};

// Get all unique users (NEW)
export const getUsers = async (req, res) => {
  try {
    const users = await Message.distinct('user');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: 'User is required' });
    }

    // Check if user already exists
    const existingUser = await Message.findOne({ user });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new message entry for the user
    const newMessage = new Message({
      user,
      message: 'Welcome to WhatsApp Chat Dashboard!',
      direction: 'outgoing',
    });

    await newMessage.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};
