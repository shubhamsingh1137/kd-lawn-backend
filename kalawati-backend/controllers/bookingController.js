const Booking = require("../models/Booking");
const { sendEmail, bookingConfirmEmail, bookingStatusEmail } = require("../utils/sendEmail");

// @desc  Create booking
// @route POST /api/bookings
// @access Private (user)
const createBooking = async (req, res) => {
  const {
    eventDate, eventType, package: packageId,
    guestCount, totalAmount, specialRequests,
    contactName, contactPhone, contactEmail,
  } = req.body;

  // Check if date is already booked (confirmed)
  const conflict = await Booking.findOne({
    eventDate: new Date(eventDate),
    status: { $in: ["confirmed", "pending"] },
  });
  if (conflict) {
    return res.status(400).json({ success: false, message: "This date is already booked or pending. Please choose another date." });
  }

  const booking = await Booking.create({
    user: req.user._id,
    eventDate, eventType,
    package: packageId,
    guestCount, totalAmount, specialRequests,
    contactName, contactPhone, contactEmail,
  });

  // Send confirmation email
  await sendEmail({
    to: contactEmail,
    subject: "Booking Request Received - Kalawati Marriage Lawn",
    html: bookingConfirmEmail(booking),
  });

  res.status(201).json({ success: true, message: "Booking request submitted", booking });
};

// @desc  Get my bookings
// @route GET /api/bookings/my
// @access Private (user)
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("package", "name price")
    .sort("-createdAt");
  res.json({ success: true, bookings });
};

// @desc  Cancel my booking
// @route PATCH /api/bookings/:id/cancel
// @access Private (user)
const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  if (["confirmed", "completed"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: "Cannot cancel a confirmed booking. Contact admin." });
  }
  booking.status = "cancelled";
  await booking.save();
  res.json({ success: true, message: "Booking cancelled" });
};

// ---- ADMIN ROUTES ----

// @desc  Get all bookings
// @route GET /api/bookings/admin/all
// @access Admin
const getAllBookings = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = status ? { status } : {};
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate("user", "name email phone")
    .populate("package", "name price")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), bookings });
};

// @desc  Update booking status (admin)
// @route PATCH /api/bookings/admin/:id/status
// @access Admin
const updateBookingStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

  booking.status    = status;
  booking.adminNote = adminNote || booking.adminNote;
  await booking.save();

  // Notify user
  await sendEmail({
    to: booking.contactEmail,
    subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - Kalawati Marriage Lawn`,
    html: bookingStatusEmail(booking, status),
  });

  res.json({ success: true, message: `Booking ${status}`, booking });
};

// @desc  Get booking stats for admin dashboard
// @route GET /api/bookings/admin/stats
// @access Admin
const getBookingStats = async (req, res) => {
  const stats = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
  ]);
  const total = await Booking.countDocuments();
  res.json({ success: true, total, stats });
};

module.exports = {
  createBooking, getMyBookings, cancelBooking,
  getAllBookings, updateBookingStatus, getBookingStats,
};
