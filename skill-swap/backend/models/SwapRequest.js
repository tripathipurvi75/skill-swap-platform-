// models/SwapRequest.js
// WHY: Swap requests are the core interaction of the platform.
// We track who requested, who received, and the current status.

const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    // Person sending the swap request
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Person receiving the swap request
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // What skill "from" user is offering in this swap
    skillOffered: { type: String, required: true, trim: true },
    // What skill "from" user wants from "to" user
    skillWanted: { type: String, required: true, trim: true },
    // Optional message with the request
    message: { type: String, maxlength: 500, default: "" },
    // Lifecycle of a swap request
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    // Timestamps for tracking
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests between same users
swapRequestSchema.index({ from: 1, to: 1, status: 1 });

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
