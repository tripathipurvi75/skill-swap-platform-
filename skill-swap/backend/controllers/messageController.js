// controllers/messageController.js
// PHASE 7: Chat message persistence

const Message = require("../models/Message");
const { AppError } = require("../middleware/errorMiddleware");

// @desc   Get chat history between two users
// @route  GET /api/messages/:userId
// @access Protected
const getMessages = async (req, res, next) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 }) // oldest first
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// @desc   Send a message (REST fallback — primary is Socket.io)
// @route  POST /api/messages/:userId
// @access Protected
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return next(new AppError("Message text is required.", 400));

    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: req.params.userId,
      text: text.trim(),
    });

    await message.populate("sender", "name avatar");

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// @desc   Get list of all conversations for current user
// @route  GET /api/messages
// @access Protected
const getConversations = async (req, res, next) => {
  try {
    // Aggregate to get last message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$receiver", req.user._id] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, sendMessage, getConversations };
