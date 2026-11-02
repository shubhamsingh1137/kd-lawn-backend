const express = require("express");
const router = express.Router();
const {
  createBooking,
  createWalkInBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  exportAllBookings,
  updateBookingStatus,
  getBookingStats,
  trackBookingByPhone,
  getBookedDates,
  createPaymentOrder,
  verifyPayment,
  getBookingById,
  getAdminBookingById,
  getAdminBookingInvoice,
  deleteBooking,
  addManualPayment,
  submitQRPayment,
  approveQRPayment,
  rejectQRPayment,
  updateBookingDiscount,
} = require("../controllers/bookingController");
const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");
const { uploadReceipt } = require("../config/cloudinary");

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
router.post("/", optionalAuth, createBooking);
router.get("/my", protect, getMyBookings);
// Customer cancellation disabled.
// Cancellation will only be allowed through the admin dashboard.
router.patch("/:id/cancel", protect, (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Please contact the lawn administration to cancel your booking.",
  });
});

// Admin routes
// Create Walk-in Booking
router.post("/admin/walk-in", protect, adminOnly, createWalkInBooking);
router.get("/admin/all", protect, adminOnly, getAllBookings);
router.get("/admin/export-all", protect, adminOnly, exportAllBookings);
router.get("/admin/stats", protect, adminOnly, getBookingStats);
router.post(
  "/admin/:id/manual-payment",
  protect,
  adminOnly,
  uploadReceipt.single("receipt"),
  addManualPayment,
);

// ============================================================
// QR PAYMENT ROUTES
// ============================================================

// Customer submits QR payment for admin verification
router.post(
  "/:id/qr-payment",
  protect,
  uploadReceipt.single("receipt"),
  submitQRPayment,
);

// Admin approves QR payment
router.patch(
  "/admin/:id/qr-payment/:paymentId/approve",
  protect,
  adminOnly,
  approveQRPayment,
);

// Admin rejects QR payment
router.patch(
  "/admin/:id/qr-payment/:paymentId/reject",
  protect,
  adminOnly,
  rejectQRPayment,
);
router.patch("/admin/:id/discount", protect, adminOnly, updateBookingDiscount);
router.patch("/admin/:id/status", protect, adminOnly, updateBookingStatus);
// Admin-only booking cancellation
router.patch("/admin/:id/cancel", protect, adminOnly, cancelBooking);
router.get("/admin/:id", protect, adminOnly, getAdminBookingById);
// Admin invoice PDF - reuse existing invoice generator
router.get("/admin/:id/invoice", protect, adminOnly, getAdminBookingInvoice);
router.delete("/admin/:id", protect, adminOnly, deleteBooking);

module.exports = router;
