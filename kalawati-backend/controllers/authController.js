// PATH: kalawati-backend/controllers/authController.js
// CHANGE: sendOTP + verifyOTP functions add kiye — purana register/login bilkul same hai

const jwt   = require("jsonwebtoken");
const axios  = require("axios");
const User  = require("../models/User");
const Booking = require("../models/Booking");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ── Helper: 6-digit OTP ─────────────────────────────────────────
const makeOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: Fast2SMS se OTP bhejo ──────────────────────────────
const sendOTPviaSMS = async (phone, otp) => {
  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route:            "otp",
        variables_values: otp,
        flash:            0,
        numbers:          phone,
      },
      {
        headers: {
          authorization:  process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ OTP SMS sent to ${phone}`);
  } catch (err) {
    console.error("Fast2SMS OTP error:", err.response?.data || err.message);
    // SMS fail hone pe bhi continue karo — development mein console pe dikhega
  }
};

// ──────────────────────────────────────────────────────────────────
// ✅ NEW: Send OTP
// @route POST /api/auth/send-otp
// @body  { phone: "9876543210" }
// ──────────────────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Check user
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No booking found for this mobile number",
      });
    }

    // Check booking
    const bookingExists = await Booking.exists({
      user: user._id,
    });

    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "No booking found for this mobile number",
      });
    }

    const otp = makeOTP();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    console.log(`🔐 OTP for ${phone}: ${otp}`);

    if (process.env.NODE_ENV === "production") {
      await sendOTPviaSMS(phone, otp);
    }

    res.json({
      success: true,
      message: "OTP sent successfully",

      // Development only
      ...(process.env.NODE_ENV !== "production" && {
        otp,
      }),
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
};
// ──────────────────────────────────────────────────────────────────
// ✅ NEW: Verify OTP → Login
// @route POST /api/auth/verify-otp
// @body  { phone: "9876543210", otp: "123456" }
// ──────────────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ success: false, message: "Phone and OTP required" });

    const user = await User.findOne({ phone }).select("+otp +otpExpiry");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found. Pehle booking karein." });
    if (!user.otp)
      return res.status(400).json({ success: false, message: "OTP request nahi ki gayi" });
    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpiry < new Date())
      return res.status(400).json({ success: false, message: "OTP expired. Dobara bhejein." });
    if (user.isBlocked)
      return res.status(403).json({ success: false, message: "Account blocked" });

    // OTP clear karo — use ke baad
    user.otp       = undefined;
    user.otpExpiry = undefined;
    user.isGuest   = false;
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        phone: user.phone,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

// ──────────────────────────────────────────────────────────────────
// Purana register — Admin create ke liye (bilkul same)
// ──────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────
// Purana login — Admin ke liye (bilkul same)
// ──────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────
// Purana getMe (bilkul same)
// ──────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe, sendOTP, verifyOTP };