// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getConversations);            // GET  /api/messages
router.get("/:userId", getMessages);          // GET  /api/messages/:userId
router.post("/:userId", sendMessage);         // POST /api/messages/:userId

module.exports = router;
