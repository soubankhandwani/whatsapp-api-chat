import { messageRepository } from "../repositories/messageRepository.js";
import { sendTextMessage } from "./whatsappService.js";
import { ConflictError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const messageService = {
  async getUsers() {
    const users = await messageRepository.getUsersWithLastMessage();

    const usersWithUnread = await Promise.all(
      users.map(async (u) => {
        const unreadCount = await messageRepository.getUnreadCount(u._id);
        return {
          user: u._id,
          lastMessageAt: u.lastMessageAt,
          lastMessage: u.lastMessage,
          lastDirection: u.lastDirection,
          unreadCount,
        };
      }),
    );

    return usersWithUnread;
  },

  async getMessages(user) {
    return messageRepository.findByUser(user);
  },

  async sendMessage(to, messageText) {
    // Call WhatsApp API
    const result = await sendTextMessage(to, messageText);
    const waMessageId = result?.messages?.[0]?.id;

    // Persist to DB
    const msg = await messageRepository.create({
      user: to,
      message: messageText,
      direction: "outgoing",
      status: "sent",
      read: true,
      whatsappMessageId: waMessageId || undefined,
    });

    logger.info({ to, waMessageId }, "Outgoing message sent");
    return msg;
  },

  async markAsRead(user) {
    return messageRepository.markAsRead(user);
  },

  async createContact(phoneNumber) {
    const exists = await messageRepository.userExists(phoneNumber);
    if (exists) {
      throw new ConflictError("Contact already exists");
    }

    return messageRepository.create({
      user: phoneNumber,
      message: "Contact added",
      direction: "outgoing",
      status: "sent",
      read: true,
    });
  },
};
