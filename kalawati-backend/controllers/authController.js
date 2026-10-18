const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Booking = require("../models/Booking");
const sendOTPEmail = require("../utils/sendOTPEmail");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// ── Helper: 6-digit OTP ─────────────────────────────────────────
const makeOTP = () => crypto.randomInt(100000, 1000000).toString();

// ── Helper: Fast2SMS se OTP bhejo ──────────────────────────────
const sendOTPviaSMS = async (phone, otp) => {
  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      },
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
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Find a booking using its email, not its mobile number.
    const booking = await Booking.findOne({
      contactEmail: email,
    }).sort({ createdAt: -1 });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found with this email address",
      });
    }

    const phone = String(booking.contactPhone || "").trim();

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is missing from this booking",
      });
    }

    // Email is the primary customer identity.
    let user = await User.findOne({ email });

    // Link a legacy account only when its email is missing
    // or is the generated guest placeholder.
    if (!user) {
      const legacyUser = await User.findOne({ phone });

      if (
        legacyUser &&
        (!legacyUser.email || legacyUser.email.endsWith("@guest.kdlawn.in"))
      ) {
        legacyUser.email = email;
        await legacyUser.save();
        user = legacyUser;
      }
    }

    // Create an email-specific account if no safe match exists.
    if (!user) {
      user = await User.create({
        name: booking.contactName || "Customer",
        phone,
        email,
        password: crypto.randomBytes(24).toString("hex"),
        isGuest: true,
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    const otp = makeOTP();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      console.error("OTP email delivery failed:", emailError.message);

      return res.status(502).json({
        success: false,
        message: "OTP email could not be sent. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your booking email address",
      maskedEmail: email.replace(/^(.{2})[^@]*(@.*)$/, "$1***$2"),
    });
  } catch (err) {
    console.error("Send OTP error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again later.",
    });
  }
};

// Verify OTP using the email-specific account.
const verifyOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body.otp || "").trim();

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required",
      });
    }

    // Ensure a booking exists for this email.
    const booking = await Booking.findOne({
      contactEmail: email,
    }).sort({ createdAt: -1 });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found with this email address",
      });
    }

    // Look up the OTP by email, not by phone.
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found. Please request a new OTP.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "Please request a new OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isGuest = false;

    await user.save();

    return res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// ──────────────────────────────────────────────────────────────────
// Purana register — Admin create ke liye (bilkul same)
// ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({ name, email, phone, password });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ──────────────────────────────────────────────────────────────────
// Purana login — Admin ke liye (bilkul same)
// ──────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res
      .status(403)
      .json({ success: false, message: "Your account has been blocked" });
  }

  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ──────────────────────────────────────────────────────────────────
// Purana getMe (bilkul same)
// ──────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe, sendOTP, verifyOTP };
