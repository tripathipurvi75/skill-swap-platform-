// middleware/authMiddleware.js
// WHY: Middleware is a function that runs BETWEEN the request and the controller.
// Think of it as a security guard at the door of every protected route.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // JWT is sent as: Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — please login first.",
    });
  }

  try {
    // jwt.verify decodes AND validates the token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user object to req — available in all controllers
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    next(); // Pass to next middleware or controller
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// ── Admin guard — use AFTER protect ─────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
};

module.exports = { protect, adminOnly };
