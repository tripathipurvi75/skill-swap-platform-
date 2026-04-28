// config/db.js
// WHY: Separating DB connection into its own file = clean MVC structure.
// If you ever switch databases, you only touch this one file.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1); // Stop the server if DB fails — no point running without DB
  }
};

module.exports = connectDB;
