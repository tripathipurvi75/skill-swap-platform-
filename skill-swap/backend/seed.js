// seed.js — Run: node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skill_swap";

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: String, role: { type: String, default: "user" },
  bio: String, location: String, avatar: String,
  skillsOffered: [{ skill: String, level: String }],
  skillsWanted: [{ skill: String, level: String }],
  availability: [{ day: String, timeSlot: String }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  ratings: Array, bookmarks: Array, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const demoUsers = [
  {
    name: "Arjun Sharma", email: "arjun@demo.com", password: "demo123",
    role: "admin", bio: "Full-stack developer and music enthusiast from Delhi.",
    location: "Delhi, India",
    skillsOffered: [{ skill: "Python", level: "Advanced" }, { skill: "React", level: "Intermediate" }],
    skillsWanted: [{ skill: "Guitar", level: "Beginner" }, { skill: "Spanish", level: "Beginner" }],
    availability: [{ day: "Sat", timeSlot: "Morning" }, { day: "Sun", timeSlot: "Afternoon" }],
  },
  {
    name: "Priya Patel", email: "priya@demo.com", password: "demo123",
    bio: "Professional guitarist and yoga instructor.", location: "Mumbai, India",
    skillsOffered: [{ skill: "Guitar", level: "Advanced" }, { skill: "Yoga", level: "Advanced" }],
    skillsWanted: [{ skill: "Python", level: "Beginner" }, { skill: "React", level: "Beginner" }],
    availability: [{ day: "Sat", timeSlot: "Morning" }, { day: "Wed", timeSlot: "Evening" }],
  },
  {
    name: "Rahul Mehta", email: "rahul@demo.com", password: "demo123",
    bio: "Spanish teacher and photography enthusiast.", location: "Bangalore, India",
    skillsOffered: [{ skill: "Spanish", level: "Advanced" }, { skill: "Photography", level: "Intermediate" }],
    skillsWanted: [{ skill: "React", level: "Intermediate" }, { skill: "Data Science", level: "Beginner" }],
    availability: [{ day: "Sun", timeSlot: "Afternoon" }, { day: "Fri", timeSlot: "Evening" }],
  },
  {
    name: "Sneha Iyer", email: "sneha@demo.com", password: "demo123",
    bio: "Data scientist who loves to cook and teach math.", location: "Hyderabad, India",
    skillsOffered: [{ skill: "Data Science", level: "Advanced" }, { skill: "Cooking", level: "Intermediate" }],
    skillsWanted: [{ skill: "Photography", level: "Beginner" }, { skill: "Guitar", level: "Beginner" }],
    availability: [{ day: "Sat", timeSlot: "Afternoon" }, { day: "Sun", timeSlot: "Morning" }],
  },
  {
    name: "Vikram Singh", email: "vikram@demo.com", password: "demo123",
    bio: "Freelance UI/UX designer and chess player.", location: "Pune, India",
    skillsOffered: [{ skill: "UI/UX Design", level: "Advanced" }, { skill: "Chess", level: "Intermediate" }],
    skillsWanted: [{ skill: "Python", level: "Intermediate" }, { skill: "Yoga", level: "Beginner" }],
    availability: [{ day: "Mon", timeSlot: "Evening" }, { day: "Thu", timeSlot: "Night" }],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    const salt = await bcrypt.genSalt(12);
    const created = await Promise.all(
      demoUsers.map(async (u) => {
        return User.create({ ...u, password: await bcrypt.hash(u.password, salt) });
      })
    );

    console.log(`🌱 Seeded ${created.length} demo users:`);
    demoUsers.forEach((u) => console.log(`   ${u.role === "admin" ? "👑" : "👤"} ${u.name} → ${u.email} / demo123`));
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();

