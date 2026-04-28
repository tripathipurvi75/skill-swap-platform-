// models/User.js
// WHY: The User model is the heart of the entire platform.
// We define it once and use it everywhere (auth, profiles, matching).

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ── PHASE 2: Auth Fields ────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // NEVER return password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ── PHASE 3: Profile Fields ─────────────────────────────
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },

    // Skills the user can TEACH others
    skillsOffered: [
      {
        skill: { type: String, required: true, trim: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Intermediate",
        },
      },
    ],

    // Skills the user wants to LEARN
    skillsWanted: [
      {
        skill: { type: String, required: true, trim: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner",
        },
      },
    ],

    // When the user is free to swap skills
    availability: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        timeSlot: {
          type: String,
          enum: ["Morning", "Afternoon", "Evening", "Night"],
        },
      },
    ],

    // ── PHASE 6: Ratings ────────────────────────────────────
    ratings: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // ── PHASE 7: Bookmarks ──────────────────────────────────
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Pre-save Hook: Hash password before storing ─────────────
// WHY: Never store plain text passwords. Bcrypt is a one-way hash.
// Even if DB is leaked, passwords are safe.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare password at login ──────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Virtual: Calculate average rating dynamically ───────────
userSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
};

module.exports = mongoose.model("User", userSchema);
