import Message from "../models/Message.js";

export const messageRepository = {
  async create(data) {
    return Message.create(data);
  },

  async findByUser(user, { limit = 100, before } = {}) {
    const query = { user };
    if (before) query.createdAt = { $lt: before };
    return Message.find(query).sort({ createdAt: 1 }).limit(limit).lean();
  },

  async findByWhatsappId(whatsappMessageId) {
    return Message.findOne({ whatsappMessageId }).lean();
  },

  async updateStatusByWhatsappId(whatsappMessageId, status) {
    return Message.findOneAndUpdate(
      { whatsappMessageId },
      { $set: { status } },
      { new: true },
    );
  },

  async markAsRead(user) {
    return Message.updateMany(
      { user, direction: "incoming", read: false },
      { $set: { read: true, status: "read" } },
    );
  },

  async getUsersWithLastMessage() {
    return Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          lastMessageAt: { $first: "$createdAt" },
          lastMessage: { $first: "$message" },
          lastDirection: { $first: "$direction" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);
  },

  async getUnreadCount(user) {
    return Message.countDocuments({ user, direction: "incoming", read: false });
  },

  async userExists(user) {
    return Message.exists({ user });
  },
};
