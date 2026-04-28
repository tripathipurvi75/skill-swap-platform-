// server.js
// PHASE 1 + 7: Entry point — Express + Socket.io

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app); // wrap Express in HTTP server for Socket.io

// ── Socket.io setup ──────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Track online users: userId → socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys())); // broadcast online list
  });

  // Handle sending a message via socket
  socket.on("message:send", async (data) => {
    try {
      const { senderId, receiverId, text } = data;
      const conversationId = Message.getConversationId(senderId, receiverId);

      // Persist to DB
      const message = await Message.create({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        text,
      });
      await message.populate("sender", "name avatar");

      // Emit to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", message);
      }

      // Confirm to sender
      socket.emit("message:sent", message);
    } catch (err) {
      socket.emit("message:error", { message: err.message });
    }
  });

  // Typing indicators
  socket.on("typing:start", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:start", { senderId });
    }
  });

  socket.on("typing:stop", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:stop", { senderId });
    }
  });

  socket.on("disconnect", () => {
    // Remove user from online map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Express Middleware ───────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Connect Database ─────────────────────────────────────────
connectDB();

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/swaps", require("./routes/swapRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "🚀 Skill Swap API running!", timestamp: new Date() })
);

// ── Global Error Handler (must be last) ─────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ Socket.io ready`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});
