const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({ name, email, phone, password });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ success: false, message: "Your account has been blocked" });
  }

  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc  Get logged-in user profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
