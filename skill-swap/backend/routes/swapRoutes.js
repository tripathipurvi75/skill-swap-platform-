// routes/swapRoutes.js
const express = require("express");
const router = express.Router();
const { sendSwapRequest, getMySwaps, respondToSwap, cancelSwap } = require("../controllers/swapController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", sendSwapRequest);                    // POST   /api/swaps
router.get("/", getMySwaps);                          // GET    /api/swaps
router.put("/:id/respond", respondToSwap);            // PUT    /api/swaps/:id/respond
router.put("/:id/cancel", cancelSwap);                // PUT    /api/swaps/:id/cancel

module.exports = router;
