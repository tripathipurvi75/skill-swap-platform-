// controllers/authController.js
// PHASE 2: Authentication logic

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../middleware/errorMiddleware");

// ── Helper: Generate JWT token ───────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// ── Helper: Send token response ──────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      averageRating: user.averageRating,
    },
  });
};

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Please provide name, email, and password.", 400));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("Email already registered. Please login.", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    sendTokenResponse(user, 201, res, "Account created successfully!");
  } catch (err) {
    next(err);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password.", 400));
    }

    // Explicitly select password since it's select:false in schema
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid email or password.", 401));
    }

    sendTokenResponse(user, 200, res, "Login successful!");
  } catch (err) {
    next(err);
  }
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
// @access Protected
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "bookmarks",
      "name avatar skillsOffered averageRating"
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
