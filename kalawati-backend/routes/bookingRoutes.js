const express = require("express");
const router  = express.Router();
const {
  createBooking, getMyBookings, cancelBooking,
  getAllBookings, updateBookingStatus, getBookingStats,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// User routes
router.post("/",              protect, createBooking);
router.get("/my",             protect, getMyBookings);
router.patch("/:id/cancel",   protect, cancelBooking);

// Admin routes
router.get("/admin/all",       protect, adminOnly, getAllBookings);
router.get("/admin/stats",     protect, adminOnly, getBookingStats);
router.patch("/admin/:id/status", protect, adminOnly, updateBookingStatus);

module.exports = router;
