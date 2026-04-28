// models/Message.js
// WHY: For Socket.io chat, we persist messages to DB
// so users can see chat history when they reconnect.

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // A conversation is between two users (sorted IDs for consistency)
    conversationId: { type: String, required: true, index: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helper: generate consistent conversation ID regardless of sender/receiver order
messageSchema.statics.getConversationId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

module.exports = mongoose.model("Message", messageSchema);
