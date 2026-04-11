import { messageService } from "../services/messageService.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    const saved = await messageService.sendMessage(to, message);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) io.emit("new-message", saved);

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const getMessageHistory = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.params.user);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    await messageService.markAsRead(req.params.user);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await messageService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    await messageService.createContact(phoneNumber);
    res.status(201).json({ message: "Contact created" });
  } catch (error) {
    next(error);
  }
};
