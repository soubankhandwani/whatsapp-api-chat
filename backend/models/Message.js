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

import mongoose from 'mongoose';

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
      enum: ['incoming', 'outgoing'],
      required: true,
    },
    // Add media support later
    media: {
      url: String,
      caption: String,
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document', null],
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
