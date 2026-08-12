// PATH: kalawati-backend/controllers/bookingController.js
// CHANGE: Sirf updateBookingStatus function mein payment link email add ki
//         Baki sab functions bilkul same hain

const Booking = require("../models/Booking");
const User    = require("../models/User");
const crypto  = require("crypto");
const bcrypt  = require("bcryptjs");
const Razorpay = require("razorpay");
const {
  sendEmail,
  bookingConfirmEmail,
  bookingBillEmail,
  adminBookingAlertEmail,
  confirmedPaymentLinkEmail,  // ✅ NEW
  paymentReceiptEmail,        // ✅ NEW
  adminPaymentAlertEmail,     // ✅ NEW
} = require("../utils/sendEmail");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Create booking — bilkul same as before
const createBooking = async (req, res) => {
  try {
    const {
      eventDate, eventType, package: packageId, guestCount,
      specialRequests, contactName, contactPhone, contactEmail, totalAmount,
    } = req.body;

    let userId = req.user?._id;
    if (!userId) {
      let guestUser = await User.findOne({ phone: contactPhone });
      if (!guestUser) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        guestUser = await User.create({
          name: contactName, phone: contactPhone,
          email: contactEmail || `${contactPhone}@guest.kdlawn.in`,
          password: hashedPassword, isGuest: true,
        });
      }
      userId = guestUser._id;
    }

    const booking = await Booking.create({
      user: userId, eventDate, eventType, package: packageId,
      guestCount, specialRequests, contactName, contactPhone,
      contactEmail: contactEmail || "", totalAmount, status: "pending",
    });

    const populated = await booking.populate("package");

    if (booking.contactEmail) {
      await sendEmail({
        to:      booking.contactEmail,
        subject: "Booking Request Received - KD Utsav Lawn",
        html:    bookingConfirmEmail(populated),
      });
    }

    await sendEmail({
      to:      process.env.ADMIN_EMAIL,
      subject: "New Booking Request - KD Utsav Lawn",
      html:    adminBookingAlertEmail(populated),
    });

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

// @desc  Get my bookings — same
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("package", "name price")
    .sort("-createdAt");
  res.json({ success: true, bookings });
};

// @desc  Cancel booking — same
const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  if (["confirmed", "completed"].includes(booking.status))
    return res.status(400).json({ success: false, message: "Cannot cancel a confirmed booking. Contact admin." });
  booking.status = "cancelled";
  await booking.save();
  res.json({ success: true, message: "Booking cancelled" });
};

// @desc  Get all bookings (admin) — same
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

// ✅ CHANGED: updateBookingStatus
// Sirf ek cheez badli: jab admin "confirmed" kare toh
// user ko payment link wali email jaye
const updateBookingStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  const booking = await Booking.findById(req.params.id).populate("package", "name price");
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

  booking.status    = status;
  booking.adminNote = adminNote || booking.adminNote;
  await booking.save();

  if (booking.contactEmail) {
    if (status === "confirmed") {
      // ✅ Confirmed pe payment link email
      const payLink = `${process.env.FRONTEND_URL}/pay/${booking._id}`;
      await sendEmail({
        to:      booking.contactEmail,
        subject: "Booking Confirmed — Advance Payment Link | KD Utsav Lawn",
        html:    confirmedPaymentLinkEmail(booking, payLink),
      });
    } else {
      // Baaki status pe purani bill email (same as before)
      await sendEmail({
        to:      booking.contactEmail,
        subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - KD Utsav Lawn`,
        html:    bookingBillEmail(booking, status),
      });
    }
  }

  res.json({ success: true, message: `Booking ${status}`, booking });
};

// @desc  Get booking stats — same
const getBookingStats = async (req, res) => {
  const stats = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
  ]);
  const total = await Booking.countDocuments();
  res.json({ success: true, total, stats });
};

// @desc  Track by phone — same
// @desc Track bookings - OTP verified user only
const trackBookingByPhone = async (req, res) => {
  try {
    // protect middleware ke through authenticated user milega
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    // Sirf logged-in/OTP verified user ki bookings
    const bookings = await Booking.find({ user: userId })
      .populate("package", "name price")
      .sort("-createdAt")
      .select("-user");

    res.json({
      success: true,
      bookings,
    });

  } catch (err) {
    console.error("Track booking error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch bookings",
    });
  }
};

// @desc  Booked dates — same
const getBookedDates = async (req, res) => {
  const bookings = await Booking.find(
    { status: { $in: ["pending", "confirmed"] } },
    { eventDate: 1, _id: 0 }
  );
  const dates = bookings.map(b => b.eventDate.toISOString().split("T")[0]);
  res.json({ success: true, dates });
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate("package", "name price")
      .select("-razorpaySignature");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied"
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (err) {
    console.error("Get booking error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch booking"
    });
  }
};

// @desc Get single booking details for admin
const getAdminBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("package", "name price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking,
    });

  } catch (err) {
    console.error("Admin booking details error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch booking details",
      error: err.message,
    });
  }
};

// ✅ NEW: Create Razorpay order (advance ya balance)
const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, type } = req.body;
    // type = "advance" ya "balance"
   const booking = await Booking.findOne({
  _id: bookingId,
  user: req.user._id
});

if (!booking) {
  return res.status(404).json({
    success: false,
    message: "Booking not found or access denied"
  });
}

console.log("========== PAYMENT DEBUG ==========");
console.log("Booking ID:", booking._id.toString());
console.log("Booking User:", booking.user?.toString());
console.log("Logged-in User:", req.user._id.toString());
console.log("Booking Status:", JSON.stringify(booking.status));
console.log("===================================");

if (String(booking.status).trim().toLowerCase() !== "confirmed") {
  return res.status(400).json({
    success: false,
    message: `Booking is not confirmed yet. Current status: ${booking.status}`
  });
}

    const ADVANCE = 5000;
    const amount  = type === "advance"
      ? ADVANCE
      : (booking.totalAmount - booking.advanceAmount);

    if (amount <= 0)
      return res.status(400).json({ success: false, message: "Koi payment baaki nahi" });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: "INR",
      receipt:  `kd_${type}_${Date.now()}`,
      notes:    { bookingId: booking._id.toString(), type },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      order:   { id: order.id, amount: order.amount, currency: order.currency },
      booking: { _id: booking._id, totalAmount: booking.totalAmount, advanceAmount: booking.advanceAmount },
    });
 } catch (err) {
  console.error("========== RAZORPAY ORDER ERROR ==========");
  console.error("Message:", err.message);
  console.error("Razorpay Response:", err.response?.data);
  console.error("Status:", err.statusCode);
  console.error("Stack:", err.stack);
  console.error("==========================================");

  res.status(500).json({
    success: false,
    message: "Order create failed",
    error: err.message,
  });
}
};

// ✅ NEW: Verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id,
      razorpay_signature, bookingId, type,
    } = req.body;

    // Signature verify
    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Payment verification failed" });

    const ADVANCE = 5000;
    const booking = await Booking.findOne({
  _id: bookingId,
  user: req.user._id
}).populate("package", "name price");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const paidAmount = type === "advance" ? ADVANCE : (booking.totalAmount - booking.advanceAmount);

    booking.razorpayPaymentId = razorpay_payment_id;
booking.razorpaySignature = razorpay_signature;


// Calculate total paid amount
if (type === "advance") {
  booking.advanceAmount =
    (booking.advanceAmount || 0) + paidAmount;
} else {
  booking.advanceAmount = booking.totalAmount;
}

// Calculate remaining amount
booking.remainingAmount = Math.max(
  booking.totalAmount - booking.advanceAmount,
  0
);

// Payment status
booking.paymentStatus =
  booking.remainingAmount === 0
    ? "fully_paid"
    : "advance_paid";

await booking.save();

    // User ko receipt
    if (booking.contactEmail) {
      await sendEmail({
        to:      booking.contactEmail,
        subject: type === "advance"
          ? "Advance Payment Received — KD Utsav Lawn"
          : "Full Payment Received — KD Utsav Lawn",
        html:    paymentReceiptEmail(booking, paidAmount, type),
      });
    }

    // Admin ko alert
    await sendEmail({
      to:      process.env.ADMIN_EMAIL,
      subject: `Payment Received: ${booking.contactName} — Rs ${paidAmount.toLocaleString("en-IN")}`,
      html:    adminPaymentAlertEmail(booking, paidAmount, type),
    });

    res.json({ success: true, message: "Payment verified!", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

module.exports = {
  createBooking, getMyBookings, cancelBooking,
  getAllBookings, updateBookingStatus, getBookingStats,
  trackBookingByPhone, getBookedDates,
  // ✅ NEW
  getBookingById, getAdminBookingById, createPaymentOrder, verifyPayment,
};