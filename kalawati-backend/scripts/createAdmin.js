// scripts/createAdmin.js
// Run: node scripts/createAdmin.js

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const User = require("../models/User");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: "admin@kalawati.com" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name:     "Kalawati Admin",
    email:    "admin@kalawati.com",
    phone:    "9999999999",
    password: "admin@123",
    role:     "admin",
  });

  console.log("✅ Admin created successfully!");
  console.log("   Email:   ", admin.email);
  console.log("   Password: admin@123");
  console.log("   ⚠️  Change this password after first login!");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
