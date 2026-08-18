const express = require("express");
const router  = express.Router();
const {
  createBooking, getMyBookings, cancelBooking,
  getAllBookings, updateBookingStatus, getBookingStats,trackBookingByPhone , getBookedDates,createPaymentOrder,
  verifyPayment,getBookingById, getAdminBookingById, deleteBooking
} = require("../controllers/bookingController");
const { protect, optionalAuth, adminOnly } = require("../middleware/authMiddleware");

// Public - NO auth needed
//router.get("/track", trackBookingByPhone);
router.get("/booked-dates", getBookedDates);

// Track booking - OTP verified user only
router.get("/track", protect, trackBookingByPhone);

// Payment routes - OTP/JWT verified user only
router.get("/:id/public", protect, getBookingById);

router.post("/create-order", protect, createPaymentOrder);

router.post("/verify-payment", protect, verifyPayment);

// User routes
router.post("/",              optionalAuth, createBooking);
router.get("/my",             protect, getMyBookings);
router.patch("/:id/cancel",   protect, cancelBooking);

// Admin routes
router.get("/admin/all",       protect, adminOnly, getAllBookings);
router.get("/admin/stats",     protect, adminOnly, getBookingStats);
router.patch("/admin/:id/status", protect, adminOnly, updateBookingStatus);
router.get("/admin/:id",protect,adminOnly,getAdminBookingById);
router.delete("/admin/:id",protect,adminOnly,deleteBooking);

module.exports = router;
