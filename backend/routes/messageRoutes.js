import express from "express";
import {
  sendMessage,
  getMessageHistory,
  getUsers,
  createUser,
  markMessagesAsRead,
} from "../controllers/messageController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  sendMessageSchema,
  createContactSchema,
} from "../validators/messageValidator.js";

const router = express.Router();

// All message routes require authentication
router.use(authenticate);

router.get("/users", getUsers);
router.post("/users", validate(createContactSchema), createUser);
router.post("/send", validate(sendMessageSchema), sendMessage);
router.put("/mark-read/:user", markMessagesAsRead);
router.get("/history/:user", getMessageHistory);

export default router;
