// controllers/userController.js
// PHASE 3, 4, 6, 7: Profile, Matching, Ratings, Bookmarks, Search

const User = require("../models/User");
const { AppError } = require("../middleware/errorMiddleware");

// ── PHASE 3: Update own profile ─────────────────────────────
// @route  PUT /api/users/profile
// @access Protected
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "bio", "location", "avatar", "skillsOffered", "skillsWanted", "availability"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,        // return updated document
      runValidators: true,
    });

    res.json({ success: true, message: "Profile updated!", user });
  } catch (err) {
    next(err);
  }
};

// ── Get any user's public profile ───────────────────────────
// @route  GET /api/users/:id
// @access Protected
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(new AppError("User not found.", 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PHASE 4: Smart Matching Algorithm ───────────────────────
// @route  GET /api/users/matches
// @access Protected
// HOW IT WORKS:
//   I offer [Python, Guitar] and want [Spanish, Yoga]
//   A match is someone who:
//     - Offers at least one skill I want (Spanish or Yoga)
//     - AND wants at least one skill I offer (Python or Guitar)
//   We then score the match based on how many overlapping skills exist.
const getMatches = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    if (!me) return next(new AppError("User not found.", 404));

    const myOffered = me.skillsOffered.map((s) => s.skill.toLowerCase());
    const myWanted = me.skillsWanted.map((s) => s.skill.toLowerCase());

    if (myOffered.length === 0 || myWanted.length === 0) {
      return res.json({
        success: true,
        count: 0,
        matches: [],
        message: "Add skills offered and wanted to find matches.",
      });
    }

    // Find all other active users
    const allUsers = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      "skillsOffered.0": { $exists: true },
      "skillsWanted.0": { $exists: true },
    }).select("-password");

    const matches = [];

    for (const user of allUsers) {
      const theirOffered = user.skillsOffered.map((s) => s.skill.toLowerCase());
      const theirWanted = user.skillsWanted.map((s) => s.skill.toLowerCase());

      // Skills they can teach that I want to learn
      const theyCanTeachMe = theirOffered.filter((s) => myWanted.includes(s));
      // Skills I can teach that they want to learn
      const iCanTeachThem = myOffered.filter((s) => theirWanted.includes(s));

      // BOTH conditions must be true for a real swap to be possible
      if (theyCanTeachMe.length > 0 && iCanTeachThem.length > 0) {
        // Check availability overlap (bonus condition)
        const myDays = me.availability.map((a) => a.day);
        const theirDays = user.availability.map((a) => a.day);
        const availabilityOverlap = myDays.filter((d) => theirDays.includes(d));

        // Score: more overlap = better match
        const score =
          theyCanTeachMe.length * 3 +
          iCanTeachThem.length * 3 +
          availabilityOverlap.length * 1 +
          user.averageRating * 2;

        matches.push({
          user: {
            id: user._id,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            location: user.location,
            skillsOffered: user.skillsOffered,
            skillsWanted: user.skillsWanted,
            availability: user.availability,
            averageRating: user.averageRating,
            totalRatings: user.totalRatings,
          },
          matchDetails: {
            theyCanTeachMe,
            iCanTeachThem,
            availabilityOverlap,
            score: Math.round(score * 10) / 10,
          },
        });
      }
    }

    // Sort by score descending — best matches first
    matches.sort((a, b) => b.matchDetails.score - a.matchDetails.score);

    res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
};

// ── PHASE 7: Search & Filter users ──────────────────────────
// @route  GET /api/users/search?skill=python&level=Intermediate&location=Delhi
// @access Protected
const searchUsers = async (req, res, next) => {
  try {
    const { skill, level, location, page = 1, limit = 10 } = req.query;

    const query = { _id: { $ne: req.user._id }, isActive: true };

    if (skill) {
      query["skillsOffered.skill"] = { $regex: skill, $options: "i" };
    }
    if (level) {
      query["skillsOffered.level"] = level;
    }
    if (location) {
      query["location"] = { $regex: location, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select("-password -ratings")
      .sort({ averageRating: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// ── PHASE 6: Rate a user ─────────────────────────────────────
// @route  POST /api/users/:id/rate
// @access Protected
const rateUser = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5.", 400));
    }

    if (req.params.id === req.user._id.toString()) {
      return next(new AppError("You cannot rate yourself.", 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found.", 404));

    // Check if already rated
    const alreadyRated = user.ratings.find(
      (r) => r.from.toString() === req.user._id.toString()
    );
    if (alreadyRated) {
      // Update existing rating
      alreadyRated.rating = rating;
      alreadyRated.feedback = feedback || alreadyRated.feedback;
    } else {
      user.ratings.push({ from: req.user._id, rating, feedback });
    }

    // Recalculate average
    const sum = user.ratings.reduce((acc, r) => acc + r.rating, 0);
    user.averageRating = Math.round((sum / user.ratings.length) * 10) / 10;
    user.totalRatings = user.ratings.length;

    await user.save();

    res.json({
      success: true,
      message: "Rating submitted!",
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
    });
  } catch (err) {
    next(err);
  }
};

// ── PHASE 7: Bookmark a user ─────────────────────────────────
// @route  POST /api/users/:id/bookmark
// @access Protected
const toggleBookmark = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return next(new AppError("You cannot bookmark yourself.", 400));
    }

    const me = await User.findById(req.user._id);
    const isBookmarked = me.bookmarks.includes(targetId);

    if (isBookmarked) {
      me.bookmarks = me.bookmarks.filter((id) => id.toString() !== targetId);
    } else {
      me.bookmarks.push(targetId);
    }

    await me.save();

    res.json({
      success: true,
      bookmarked: !isBookmarked,
      message: isBookmarked ? "Bookmark removed." : "User bookmarked!",
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Get all users ─────────────────────────────────────
// @route  GET /api/users (admin)
// @access Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile, getUserProfile, getMatches,
  searchUsers, rateUser, toggleBookmark, getAllUsers,
};
