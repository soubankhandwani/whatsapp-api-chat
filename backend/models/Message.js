// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   user: { type: String, required: true },
//   message: { type: String, required: true },
//   direction: {
//     type: String,
//     enum: ['incoming', 'outgoing'],
//     required: true,
//   },
//   timestamp: { type: Date, default: Date.now },
// });

// export default mongoose.model('Message', messageSchema);

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
    },
    read: {
      type: Boolean,
      default: false,
    },
    // WhatsApp message ID for idempotency and status tracking
    whatsappMessageId: {
      type: String,
      index: true,
      sparse: true,
    },
    media: {
      url: String,
      caption: String,
      type: {
        type: String,
        enum: ["image", "video", "audio", "document", null],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ whatsappMessageId: 1 }, { unique: true, sparse: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;
