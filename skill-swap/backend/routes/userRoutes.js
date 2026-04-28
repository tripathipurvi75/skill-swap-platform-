// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  updateProfile, getUserProfile, getMatches,
  searchUsers, rateUser, toggleBookmark, getAllUsers,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.get("/search", searchUsers);             // GET /api/users/search
router.get("/matches", getMatches);             // GET /api/users/matches
router.put("/profile", updateProfile);          // PUT /api/users/profile
router.get("/:id", getUserProfile);             // GET /api/users/:id
router.post("/:id/rate", rateUser);             // POST /api/users/:id/rate
router.post("/:id/bookmark", toggleBookmark);   // POST /api/users/:id/bookmark
router.get("/", adminOnly, getAllUsers);         // GET /api/users (admin)

module.exports = router;
