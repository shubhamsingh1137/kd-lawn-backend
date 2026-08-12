// PATH: kalawati-backend/routes/authRoutes.js
// CHANGE: Sirf 2 nayi routes add ki — send-otp aur verify-otp

const express = require("express");
const router  = express.Router();
const { register, login, getMe, sendOTP, verifyOTP } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ✅ NEW — OTP based login (users ke liye)
router.post("/send-otp",   sendOTP);
router.post("/verify-otp", verifyOTP);

// Same as before — admin ke liye
router.post("/register", register);
router.post("/login",    login);
router.get("/me",        protect, getMe);

module.exports = router;