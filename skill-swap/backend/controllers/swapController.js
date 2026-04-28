// controllers/swapController.js
// PHASE 5: Handle all swap request lifecycle

const SwapRequest = require("../models/SwapRequest");
const { AppError } = require("../middleware/errorMiddleware");

// @desc   Send a swap request to another user
// @route  POST /api/swaps
// @access Protected
const sendSwapRequest = async (req, res, next) => {
  try {
    const { to, skillOffered, skillWanted, message } = req.body;

    if (!to || !skillOffered || !skillWanted) {
      return next(new AppError("Please provide recipient, skillOffered, and skillWanted.", 400));
    }

    if (to === req.user._id.toString()) {
      return next(new AppError("You cannot send a swap request to yourself.", 400));
    }

    // Prevent duplicate pending requests
    const existing = await SwapRequest.findOne({
      from: req.user._id,
      to,
      status: "pending",
    });
    if (existing) {
      return next(new AppError("You already have a pending request with this user.", 400));
    }

    const swap = await SwapRequest.create({
      from: req.user._id,
      to,
      skillOffered,
      skillWanted,
      message,
    });

    await swap.populate([
      { path: "from", select: "name avatar" },
      { path: "to", select: "name avatar" },
    ]);

    res.status(201).json({ success: true, message: "Swap request sent!", swap });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all requests (sent + received) for current user
// @route  GET /api/swaps
// @access Protected
const getMySwaps = async (req, res, next) => {
  try {
    const sent = await SwapRequest.find({ from: req.user._id })
      .populate("to", "name avatar skillsOffered averageRating")
      .sort({ createdAt: -1 });

    const received = await SwapRequest.find({ to: req.user._id })
      .populate("from", "name avatar skillsOffered averageRating")
      .sort({ createdAt: -1 });

    res.json({ success: true, sent, received });
  } catch (err) {
    next(err);
  }
};

// @desc   Accept or reject a swap request
// @route  PUT /api/swaps/:id/respond
// @access Protected
const respondToSwap = async (req, res, next) => {
  try {
    const { action } = req.body; // "accept" | "reject"

    if (!["accept", "reject"].includes(action)) {
      return next(new AppError("Action must be 'accept' or 'reject'.", 400));
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return next(new AppError("Swap request not found.", 404));

    // Only the RECEIVER can respond
    if (swap.to.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to respond to this request.", 403));
    }

    if (swap.status !== "pending") {
      return next(new AppError("This request has already been responded to.", 400));
    }

    swap.status = action === "accept" ? "accepted" : "rejected";
    swap.respondedAt = new Date();
    await swap.save();

    res.json({
      success: true,
      message: `Swap request ${swap.status}!`,
      swap,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel a sent request (only sender can cancel)
// @route  PUT /api/swaps/:id/cancel
// @access Protected
const cancelSwap = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return next(new AppError("Swap request not found.", 404));

    if (swap.from.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to cancel this request.", 403));
    }

    if (swap.status !== "pending") {
      return next(new AppError("Only pending requests can be cancelled.", 400));
    }

    swap.status = "cancelled";
    await swap.save();

    res.json({ success: true, message: "Request cancelled.", swap });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendSwapRequest, getMySwaps, respondToSwap, cancelSwap };
