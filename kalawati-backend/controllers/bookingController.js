const Booking = require("../models/Booking");
const BookingCounter = require("../models/BookingCounter");
const isEventDateBooked = async (eventDate) => {
  const start = new Date(`${eventDate}T00:00:00.000Z`);
  const end = new Date(`${eventDate}T23:59:59.999Z`);

  return Booking.exists({
    eventDate: { $gte: start, $lte: end },
    status: { $in: ["pending", "confirmed"] },
  });
};
const User = require("../models/User");
const Package = require("../models/Package");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const createInvoicePdf = require("../utils/createInvoicePdf");
const {
  sendEmail,
  bookingConfirmEmail,
  bookingBillEmail,
  bookingRejectedEmail,
  adminBookingAlertEmail,
  confirmedPaymentLinkEmail, // ✅ NEW
  paymentReceiptEmail, // ✅ NEW
  adminPaymentAlertEmail, // ✅ NEW
} = require("../utils/sendEmail");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateBookingNumber = async (createdAt = new Date()) => {
  const dateKey = [
    String(createdAt.getDate()).padStart(2, "0"),
    String(createdAt.getMonth() + 1).padStart(2, "0"),
    String(createdAt.getFullYear()).slice(-2),
  ].join("");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const counter = await BookingCounter.findOneAndUpdate(
        { dateKey },
        {
          $inc: { sequence: 1 },
          $setOnInsert: { dateKey },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      return `KDL-${dateKey}-${String(counter.sequence).padStart(4, "0")}`;
    } catch (error) {
      if (error.code !== 11000 || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate booking number");
};

// @desc  Create booking — bilkul same as before

const createBooking = async (req, res) => {
  try {
    const {
      eventDate,
      eventType,
      package: packageId,
      guestCount,
      specialRequests,
      contactName,
      contactPhone,
      contactEmail,
      totalAmount,
    } = req.body;

    if (
      !contactName?.trim() ||
      !contactPhone?.trim() ||
      !contactEmail?.trim() ||
      !eventDate ||
      !eventType ||
      !packageId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required booking details.",
      });
    }

    const alreadyBooked = await isEventDateBooked(eventDate);

    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "This date is already booked. Please try another date.",
      });
    }

    const normalizedEmail = contactEmail.trim().toLowerCase();

    let userId = req.user?._id;

    if (!userId) {
      // Find customer by email first
      let customer = await User.findOne({
        email: normalizedEmail,
      });

      // Check an older guest account using phone
      if (!customer) {
        const legacyCustomer = await User.findOne({
          phone: contactPhone.trim(),
        });

        const legacyEmail = String(legacyCustomer?.email || "")
          .trim()
          .toLowerCase();

        // Link only accounts with no real email or a guest placeholder
        if (
          legacyCustomer &&
          (!legacyEmail || legacyEmail.endsWith("@guest.kdlawn.in"))
        ) {
          legacyCustomer.email = normalizedEmail;
          legacyCustomer.name = contactName.trim();

          await legacyCustomer.save();
          customer = legacyCustomer;
        }
      }

      // Create a new guest account if needed
      if (!customer) {
        const randomPassword = crypto.randomBytes(12).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        customer = await User.create({
          name: contactName.trim(),
          phone: contactPhone.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          isGuest: true,
        });
      }

      userId = customer._id;
    }

    const initialAmount = Number(totalAmount);

    if (!Number.isFinite(initialAmount) || initialAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }
    const bookingNumber = await generateBookingNumber();
    const booking = await Booking.create({
      bookingNumber,
      user: userId,
      eventDate,
      eventType,
      package: packageId,
      guestCount,
      specialRequests,
      contactName,
      contactPhone,
      contactEmail: normalizedEmail,
      totalAmount: initialAmount,
      originalAmount: initialAmount,
      discountAmount: 0,
      payableAmount: initialAmount,
      status: "pending",
      advanceAmount: 0,
      remainingAmount: initialAmount,
      paymentStatus: "unpaid",
      paymentHistory: [],
    });

    const populated = await booking.populate("package");

    // Admin panel notification
    try {
      await Notification.create({
        type: "booking",
        title: "New Booking Request",
        message: `${booking.contactName} submitted a new booking request. Approval is pending.`,
        booking: booking._id,
        customerName: booking.contactName || "",
        customerPhone: booking.contactPhone || "",
        customerEmail: booking.contactEmail || "",
        status: "unread",
      });

      console.log("Booking notification created:", booking._id.toString());
    } catch (notificationError) {
      console.error("Booking notification error:", notificationError);
    }

    // Customer email
    if (booking.contactEmail) {
      try {
        await sendEmail({
          to: booking.contactEmail,
          subject: "Booking Request Received - KD Utsav Lawn",
          html: bookingConfirmEmail(populated),
        });

        console.log("Customer booking email sent:", booking.contactEmail);
      } catch (emailError) {
        console.error("Customer booking email error:", emailError.message);
      }
    }

    // Admin email
    try {
      if (!process.env.ADMIN_EMAIL) {
        throw new Error("ADMIN_EMAIL is not configured");
      }

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Booking Request - KD Utsav Lawn",
        html: adminBookingAlertEmail(populated),
      });

      console.log("Admin booking email sent");
    } catch (emailError) {
      console.error("Admin booking email error:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      booking: populated,
    });
  } catch (err) {
    console.error("Create booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
};

// @desc  Get my bookings — same
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("package", "name price")
    .sort("-createdAt");
  res.json({ success: true, bookings });
};

const createWalkInBooking = async (req, res) => {
  try {
    const {
      contactName,
      contactPhone,
      contactEmail,
      contactAddress,
      eventType,
      eventDate,
      package: packageId,
      guestCount,
      discountAmount = 0,
      advanceAmount = 0,
      paymentMethod = "cash",
      collectedBy,
      transactionId,
      specialRequests,
      adminNote,
    } = req.body;

    // Validate customer details
    if (
      !contactName?.trim() ||
      !contactPhone?.trim() ||
      !contactEmail?.trim() ||
      !eventDate ||
      !eventType ||
      !packageId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required booking details.",
      });
    }

    const alreadyBooked = await isEventDateBooked(eventDate);

    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "This date is already booked. Please try another date.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid customer email.",
      });
    }

    const guests = Number(guestCount);
    const discount = Number(discountAmount);
    const advance = Number(advanceAmount);

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        success: false,
        message: "Guest count must be at least 1.",
      });
    }

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      !Number.isFinite(advance) ||
      advance < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount or advance amount.",
      });
    }

    // Always use the actual package price from MongoDB
    const selectedPackage = await Package.findOne({
      _id: packageId,
      isActive: true,
    });

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Selected package was not found or is inactive.",
      });
    }

    const originalAmount = Number(selectedPackage.price);

    if (discount > originalAmount) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed the package price.",
      });
    }

    const payableAmount = originalAmount - discount;

    if (advance > payableAmount) {
      return res.status(400).json({
        success: false,
        message: "Advance cannot exceed the payable amount.",
      });
    }

    // Find or create the customer account
    let customer = await User.findOne({
      phone: contactPhone.trim(),
    });

    if (!customer) {
      const randomPassword = crypto.randomBytes(12).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      customer = await User.create({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
        password: hashedPassword,
        isGuest: true,
      });
    }

    const remainingAmount = payableAmount - advance;

    // Record advance in payment history so BookingDetails
    // displays Total Paid and Remaining Amount correctly.
    const paymentHistory =
      advance > 0
        ? [
            {
              amount: advance,
              source: "manual",
              paymentMethod,
              collectedBy: collectedBy?.trim() || req.user?.name || "Admin",
              transactionId: transactionId?.trim() || "",
              note: "Advance collected during walk-in booking",
              paidAt: new Date(),
              status: "success",
            },
          ]
        : [];
    const bookingNumber = await generateBookingNumber();
    const booking = await Booking.create({
      user: customer._id,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      contactAddress: contactAddress?.trim() || "",
      eventType,
      bookingNumber,
      eventDate,
      package: selectedPackage._id,
      guestCount: guests,
      specialRequests: specialRequests?.trim() || "",
      adminNote: adminNote?.trim() || "",

      originalAmount,
      discountAmount: discount,
      payableAmount,
      totalAmount: payableAmount,

      bookingSource: "walk_in",
      status: "confirmed",
      advanceAmount: advance,
      remainingAmount,
      paymentStatus:
        remainingAmount === 0
          ? "fully_paid"
          : advance > 0
            ? "advance_paid"
            : "unpaid",

      paymentHistory,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("package", "name price")
      .populate("user", "name email phone");

    // Send a confirmation email to the customer only.
    if (populatedBooking.contactEmail) {
      await sendEmail({
        to: populatedBooking.contactEmail,
        subject: "Walk-in Booking Confirmed - KD Utsav Lawn",
        html: bookingBillEmail(populatedBooking, "confirmed"),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Walk-in booking created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create walk-in booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create walk-in booking.",
      error: error.message,
    });
  }
};

// @desc  Cancel booking — same
const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!booking)
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  if (["confirmed", "completed"].includes(booking.status))
    return res.status(400).json({
      success: false,
      message: "Cannot cancel a confirmed booking. Contact admin.",
    });
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
  try {
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "rejected",
      "cancelled",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "package",
      "name price",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Apply amount calculations when confirming the booking
    if (status === "confirmed") {
      const originalAmount = Number(
        req.body.originalAmount ??
          booking.originalAmount ??
          booking.totalAmount ??
          booking.package?.price ??
          0,
      );

      const discountAmount = Number(
        req.body.discountAmount ?? booking.discountAmount ?? 0,
      );

      if (
        !Number.isFinite(originalAmount) ||
        originalAmount < 0 ||
        !Number.isFinite(discountAmount) ||
        discountAmount < 0 ||
        discountAmount > originalAmount
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid original amount or discount amount",
        });
      }

      const payableAmount = originalAmount - discountAmount;
      const alreadyPaid = Number(booking.advanceAmount || 0);

      if (!Number.isFinite(alreadyPaid) || alreadyPaid < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid existing payment total",
        });
      }

      // Save the amounts permanently in MongoDB
      booking.originalAmount = originalAmount;
      booking.discountAmount = discountAmount;
      booking.payableAmount = payableAmount;
      booking.totalAmount = payableAmount;

      booking.remainingAmount = Math.max(payableAmount - alreadyPaid, 0);

      booking.paymentStatus =
        alreadyPaid <= 0
          ? "unpaid"
          : booking.remainingAmount === 0
            ? "fully_paid"
            : "advance_paid";
    }

    booking.status = status;

    if (adminNote !== undefined) {
      booking.adminNote = adminNote;
    }

    await booking.save();

    // Send the existing status emails
    if (booking.contactEmail) {
      if (status === "confirmed") {
        const payLink = `${process.env.FRONTEND_URL}/pay/${booking._id}`;

        await sendEmail({
          to: booking.contactEmail,
          subject: `Booking Confirmed – KD Utsav Lawn | Booking ID: ${
            booking.bookingNumber || booking._id.toString()
          }`,
          html: confirmedPaymentLinkEmail(booking, payLink),
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: booking.contactEmail,
          subject: "Booking Request Update – KD Utsav Lawn",
          html: bookingRejectedEmail(booking),
        });
      } else {
        await sendEmail({
          to: booking.contactEmail,
          subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - KD Utsav Lawn`,
          html: bookingBillEmail(booking, status),
        });
      }
    }

    return res.json({
      success: true,
      message: `Booking ${status}`,
      booking,
    });
  } catch (err) {
    console.error("Update booking status error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: err.message,
    });
  }
};

// @desc  Get booking stats — same
const getBookingStats = async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const total = await Booking.countDocuments();
  res.json({ success: true, total, stats });
};

// @desc  Track by email — same
// @desc Track bookings - OTP verified user only

const trackBookingByPhone = async (req, res) => {
  try {
    // Email must come from the authenticated, OTP-verified user.
    const email = String(req.user?.email || "")
      .trim()
      .toLowerCase();

    if (!req.user?._id || !email || email.endsWith("@guest.kdlawn.in")) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email OTP first.",
      });
    }

    // Escape special regex characters in the verified email.
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Fetch every booking associated with this email,
    // including older bookings linked to a different user ID.
    const bookings = await Booking.find({
      contactEmail: {
        $regex: `^${escapedEmail}$`,
        $options: "i",
      },
    })
      .populate("package", "name price")
      .sort({ createdAt: -1 })
      .select("-user -razorpaySignature");

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error("Track booking by email error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings.",
    });
  }
};

// @desc  Booked dates — same
const getBookedDates = async (req, res) => {
  try {
    const bookings = await Booking.find(
      {
        status: { $in: ["pending", "confirmed"] },
      },
      { eventDate: 1, _id: 0 },
    );

    const dates = bookings.map(
      (booking) => booking.eventDate.toISOString().split("T")[0],
    );

    return res.json({
      success: true,
      dates,
    });
  } catch (error) {
    console.error("Get booked dates error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booked dates",
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const email = String(req.user?.email || "")
      .trim()
      .toLowerCase();

    const booking = await Booking.findById(req.params.id)
      .populate("package", "name price")
      .select("-razorpaySignature");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const bookingEmail = String(booking.contactEmail || "")
      .trim()
      .toLowerCase();

    if (
      !email ||
      email.endsWith("@guest.kdlawn.in") ||
      !bookingEmail ||
      bookingEmail !== email
    ) {
      return res.status(403).json({
        success: false,
        message: "This booking does not belong to your verified email",
      });
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (err) {
    console.error("Get booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booking",
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
// Create Razorpay order - custom amount payment
const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Amount validate
    const paymentAmount = Number(amount);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID required",
      });
    }

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    // Verify booking using the logged-in, OTP-verified email
    const email = String(req.user?.email || "")
      .trim()
      .toLowerCase();

    const booking = await Booking.findById(bookingId).populate(
      "package",
      "name price",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Match booking email with the verified user's email
    const bookingEmail = String(booking.contactEmail || "")
      .trim()
      .toLowerCase();

    if (
      !email ||
      email.endsWith("@guest.kdlawn.in") ||
      !bookingEmail ||
      bookingEmail !== email
    ) {
      return res.status(403).json({
        success: false,
        message: "This booking does not belong to your verified email",
      });
    }

    // Booking confirmed honi chahiye
    if (String(booking.status).trim().toLowerCase() !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Booking is not confirmed yet. Current status: ${booking.status}`,
      });
    }

    // Already paid amount
    const alreadyPaid = Number(booking.advanceAmount || 0);

    // Remaining amount
    const remainingAmount = Math.max(
      Number(booking.totalAmount || 0) - alreadyPaid,
      0,
    );

    // Already fully paid
    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking is already fully paid",
      });
    }

    // User remaining se zyada pay nahi kar sakta
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum payable amount is ₹${remainingAmount.toLocaleString("en-IN")}`,
      });
    }

    console.log("========== CREATE PAYMENT ORDER ==========");
    console.log("Booking ID:", booking._id.toString());
    console.log("Total Amount:", booking.totalAmount);
    console.log("Already Paid:", alreadyPaid);
    console.log("Remaining:", remainingAmount);
    console.log("User Payment:", paymentAmount);
    console.log("==========================================");

    // Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(paymentAmount * 100),
      currency: "INR",
      receipt: `kd_${booking._id}_${Date.now()}`,
      notes: {
        bookingId: booking._id.toString(),
        paymentAmount: paymentAmount.toString(),
      },
    });

    // Latest order ID
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      booking: {
        _id: booking._id,
        totalAmount: booking.totalAmount,
        advanceAmount: alreadyPaid,
        remainingAmount,
      },
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

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are incomplete",
      });
    }

    // Booking find
    // Find booking by ID, then verify ownership using email
    const booking = await Booking.findById(bookingId).populate(
      "package",
      "name price",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify booking belongs to the authenticated customer's email
    const customerEmail = String(req.user?.email || "")
      .trim()
      .toLowerCase();

    const bookingEmail = String(booking.contactEmail || "")
      .trim()
      .toLowerCase();

    if (
      !customerEmail ||
      customerEmail.endsWith("@guest.kdlawn.in") ||
      !bookingEmail ||
      customerEmail !== bookingEmail
    ) {
      return res.status(403).json({
        success: false,
        message: "This booking does not belong to your verified email",
      });
    }

    // Verify this is the order created for this booking
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not match this booking",
      });
    }
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Booking confirmed honi chahiye
    if (String(booking.status).trim().toLowerCase() !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking is not confirmed",
      });
    }

    // ------------------------------------------------
    // Razorpay signature verify
    // ------------------------------------------------

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ------------------------------------------------
    // Duplicate payment protection
    // ------------------------------------------------

    const alreadyRecorded = booking.paymentHistory?.some(
      (payment) => payment.razorpayPaymentId === razorpay_payment_id,
    );

    if (alreadyRecorded) {
      return res.status(400).json({
        success: false,
        message: "This payment has already been recorded",
      });
    }

    // ------------------------------------------------
    // Razorpay order se actual amount nikalo
    // ------------------------------------------------

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const paidAmount = Number(razorpayOrder.amount) / 100;

    if (!paidAmount || paidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // ------------------------------------------------
    // Current remaining amount
    // ------------------------------------------------

    const alreadyPaid = Number(booking.advanceAmount || 0);

    const remainingBeforePayment = Math.max(
      Number(booking.totalAmount || 0) - alreadyPaid,
      0,
    );

    // Payment remaining se zyada nahi ho sakta
    if (paidAmount > remainingBeforePayment) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining balance",
      });
    }

    // ------------------------------------------------
    // Update total paid
    // ------------------------------------------------

    const newTotalPaid = alreadyPaid + paidAmount;

    const newRemainingAmount = Math.max(
      Number(booking.totalAmount || 0) - newTotalPaid,
      0,
    );

    booking.advanceAmount = newTotalPaid;

    booking.remainingAmount = newRemainingAmount;

    booking.paymentStatus =
      newRemainingAmount === 0 ? "fully_paid" : "advance_paid";

    // Latest Razorpay transaction
    booking.razorpayOrderId = razorpay_order_id;

    booking.razorpayPaymentId = razorpay_payment_id;

    booking.razorpaySignature = razorpay_signature;

    // ------------------------------------------------
    // PAYMENT HISTORY
    // ------------------------------------------------

    booking.paymentHistory.push({
      amount: paidAmount,

      source: "razorpay",

      paymentMethod: "razorpay",

      razorpayOrderId: razorpay_order_id,

      razorpayPaymentId: razorpay_payment_id,

      razorpaySignature: razorpay_signature,

      paidAt: new Date(),

      status: "success",
    });
    await booking.save();

    console.log("========== PAYMENT SUCCESS ==========");
    console.log("Booking:", booking._id.toString());
    console.log("This Payment:", paidAmount);
    console.log("Total Paid:", newTotalPaid);
    console.log("Remaining:", newRemainingAmount);
    console.log("Status:", booking.paymentStatus);
    console.log("=====================================");

    // ------------------------------------------------
    // Customer email
    // ------------------------------------------------

    if (booking.contactEmail) {
      const invoicePdf = await createInvoicePdf(booking);

      await sendEmail({
        to: booking.contactEmail,
        subject:
          newRemainingAmount === 0
            ? "Full Payment Received — KD Utsav Lawn"
            : "Payment Received — KD Utsav Lawn",
        html: paymentReceiptEmail(booking, paidAmount, "partial"),
        attachments: [
          {
            filename: `KD-Utsav-Invoice-${booking.bookingNumber || booking._id}.pdf`,

            content: invoicePdf,
            contentType: "application/pdf",
          },
        ],
      });
    }

    // ------------------------------------------------
    // Admin email
    // ------------------------------------------------

    await sendEmail({
      to: process.env.ADMIN_EMAIL,

      subject: `Payment Received: ${booking.contactName} — ₹${paidAmount.toLocaleString("en-IN")}`,

      html: adminPaymentAlertEmail(booking, paidAmount, "partial"),
    });

    // ------------------------------------------------
    // Response
    // ------------------------------------------------

    res.json({
      success: true,
      message: "Payment verified successfully",

      booking: {
        _id: booking._id,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        remainingAmount: booking.remainingAmount,
        paymentStatus: booking.paymentStatus,
        paymentHistory: booking.paymentHistory,
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);

    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: err.message,
    });
  }
};
// ============================================================
// ADMIN - ADD MANUAL PAYMENT
// ============================================================

const addManualPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const { amount, paymentMethod, paidAt, collectedBy, transactionId, note } =
      req.body;

    // --------------------------------------------------------
    // Validate amount
    // --------------------------------------------------------

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    // --------------------------------------------------------
    // Validate collector
    // --------------------------------------------------------

    if (!collectedBy || !collectedBy.trim()) {
      return res.status(400).json({
        success: false,
        message: "Collected By name is required",
      });
    }

    // --------------------------------------------------------
    // Find booking
    // --------------------------------------------------------

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    // Only confirmed bookings can receive manual payments
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Please confirm the booking before adding a payment.",
      });
    }

    // --------------------------------------------------------
    // Calculate already paid
    // --------------------------------------------------------

    const alreadyPaid = Number(booking.advanceAmount || 0);

    const totalAmount = Number(booking.totalAmount || 0);

    const remainingBeforePayment = Math.max(totalAmount - alreadyPaid, 0);

    // --------------------------------------------------------
    // Already fully paid
    // --------------------------------------------------------

    if (remainingBeforePayment <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking is already fully paid",
      });
    }

    // --------------------------------------------------------
    // Payment cannot exceed remaining
    // --------------------------------------------------------

    if (paymentAmount > remainingBeforePayment) {
      return res.status(400).json({
        success: false,
        message: `Maximum payable amount is ₹${remainingBeforePayment.toLocaleString(
          "en-IN",
        )}`,
      });
    }

    // --------------------------------------------------------
    // New totals
    // --------------------------------------------------------

    const newTotalPaid = alreadyPaid + paymentAmount;

    const newRemainingAmount = Math.max(totalAmount - newTotalPaid, 0);

    // --------------------------------------------------------
    // Update booking
    // --------------------------------------------------------

    booking.advanceAmount = newTotalPaid;

    booking.remainingAmount = newRemainingAmount;

    booking.paymentStatus =
      newRemainingAmount === 0 ? "fully_paid" : "advance_paid";

    // --------------------------------------------------------
    // Receipt
    // --------------------------------------------------------

    const receiptAttachment = req.file?.path || "";

    console.log("========== RECEIPT DEBUG ==========");
    console.log("req.file:", req.file);
    console.log("receipt path:", receiptAttachment);
    console.log("===================================");

    // --------------------------------------------------------
    // Add payment history
    // --------------------------------------------------------

    booking.paymentHistory.push({
      amount: paymentAmount,

      paymentMethod: paymentMethod || "cash",

      collectedBy: collectedBy.trim(),

      transactionId: transactionId?.trim() || "",

      note: note?.trim() || "",

      receiptAttachment,

      source: "manual",

      paidAt: paidAt ? new Date(paidAt) : new Date(),

      status: "success",
    });

    // --------------------------------------------------------
    // Save
    // --------------------------------------------------------

    await booking.save();

    // --------------------------------------------------------
    // Customer payment email
    // --------------------------------------------------------

    const savedPayment =
      booking.paymentHistory[booking.paymentHistory.length - 1];

    if (booking.contactEmail) {
      const invoicePdf = await createInvoicePdf(booking);

      const attachments = [
        {
          filename: `KD-Utsav-Invoice-${booking.bookingNumber || booking._id}.pdf`,
          content: invoicePdf,
          contentType: "application/pdf",
        },
      ];

      if (savedPayment.receiptAttachment) {
        attachments.push({
          filename: req.file?.originalname || "payment-receipt",
          path: savedPayment.receiptAttachment,
        });
      }

      await sendEmail({
        to: booking.contactEmail,
        subject:
          newRemainingAmount === 0
            ? "Full Payment Received — KD Utsav Lawn"
            : "Payment Received — KD Utsav Lawn",
        html: paymentReceiptEmail(
          booking,
          paymentAmount,
          "manual",
          savedPayment,
        ),
        attachments,
      });
    }

    console.log("========== MANUAL PAYMENT SUCCESS ==========");

    console.log("Booking:", booking._id.toString());

    console.log("Payment:", paymentAmount);

    console.log("Collected By:", collectedBy);

    console.log("Payment Method:", paymentMethod);

    console.log("Total Paid:", newTotalPaid);

    console.log("Remaining:", newRemainingAmount);

    console.log("============================================");

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Manual payment added successfully",

      booking: {
        _id: booking._id,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        remainingAmount: booking.remainingAmount,
        paymentStatus: booking.paymentStatus,
        paymentHistory: booking.paymentHistory,
      },
    });
  } catch (error) {
    console.error("Manual payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add manual payment",
      error: error.message,
    });
  }
};
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Booking permanently deleted",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};

const submitQRPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, transactionId, note } = req.body;

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can receive QR payments.",
      });
    }

    // Security: booking belongs to logged-in user
    if (booking.user && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this booking",
      });
    }

    const alreadyPaid = Number(booking.advanceAmount || 0);

    const totalAmount = Number(booking.totalAmount || 0);

    const remainingAmount = Math.max(totalAmount - alreadyPaid, 0);

    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking is already fully paid",
      });
    }

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum payable amount is ₹${remainingAmount.toLocaleString("en-IN")}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot/receipt is required",
      });
    }

    if (!transactionId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transaction / UTR ID is required",
      });
    }
    const receiptAttachment = req.file.path;

    booking.paymentHistory.push({
      amount: paymentAmount,
      source: "manual",
      paymentMethod: "upi",
      transactionId: transactionId.trim(),
      note: note?.trim() || "",
      receiptAttachment,
      paidAt: new Date(),
      status: "pending",
    });

    await booking.save();

    const savedPayment =
      booking.paymentHistory[booking.paymentHistory.length - 1];

    // ============================================================
    // ADMIN NOTIFICATION - NEW QR PAYMENT
    // ============================================================

    await Notification.create({
      type: "qr_payment",

      title: "New QR Payment Received",

      message: `${booking.contactName} submitted ₹${paymentAmount.toLocaleString(
        "en-IN",
      )} through QR payment. Verification required.`,

      booking: booking._id,

      payment: savedPayment._id,

      amount: paymentAmount,

      customerName: booking.contactName || "",

      customerPhone: booking.contactPhone || "",

      customerEmail: booking.contactEmail || "",

      receiptAttachment: receiptAttachment || "",

      status: "unread",
    });

    // Customer email
    if (booking.contactEmail) {
      await sendEmail({
        to: booking.contactEmail,
        subject: "QR Payment Submitted — KD Utsav Lawn",
        html: paymentReceiptEmail(
          booking,
          paymentAmount,
          "pending",
          savedPayment,
        ),
      });
    }

    // Admin email
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `QR Payment Submitted: ${booking.contactName} — ₹${paymentAmount.toLocaleString("en-IN")}`,
      html: adminPaymentAlertEmail(
        booking,
        paymentAmount,
        "pending",
        savedPayment,
      ),
      attachments: [
        {
          filename: req.file.originalname || "payment-receipt",
          path: receiptAttachment,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Payment submitted successfully. It is pending verification.",
      payment: savedPayment,
      booking: {
        _id: booking._id,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        remainingAmount: booking.remainingAmount,
        paymentStatus: booking.paymentStatus,
        paymentHistory: booking.paymentHistory,
      },
    });
  } catch (error) {
    console.error("QR payment submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit QR payment",
      error: error.message,
    });
  }
};
const approveQRPayment = async (req, res) => {
  try {
    const { id, paymentId } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be modified for payments.",
      });
    }

    const payment = booking.paymentHistory.id(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been processed",
      });
    }

    const paymentAmount = Number(payment.amount || 0);

    const alreadyPaid = Number(booking.advanceAmount || 0);

    const totalAmount = Number(booking.totalAmount || 0);

    const remainingAmount = Math.max(totalAmount - alreadyPaid, 0);

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds remaining balance",
      });
    }

    // NOW financial totals update
    booking.advanceAmount = alreadyPaid + paymentAmount;

    booking.remainingAmount = Math.max(totalAmount - booking.advanceAmount, 0);

    booking.paymentStatus =
      booking.remainingAmount === 0 ? "fully_paid" : "advance_paid";

    payment.status = "success";

    await booking.save();
    // ============================================================
    // CUSTOMER EMAIL - QR PAYMENT APPROVED
    // ============================================================

    if (booking.contactEmail) {
      const invoicePdf = await createInvoicePdf(booking);

      await sendEmail({
        to: booking.contactEmail,
        subject:
          booking.remainingAmount === 0
            ? "QR Payment Approved - Full Payment Received | KD Utsav Lawn"
            : "QR Payment Approved | KD Utsav Lawn",
        html: paymentReceiptEmail(
          booking,
          paymentAmount,
          "qr_approved",
          payment,
        ),
        attachments: [
          {
            filename: `KD-Utsav-Invoice-${booking._id}.pdf`,
            content: invoicePdf,
            contentType: "application/pdf",
          },
        ],
      });
    }

    // ============================================================
    // ADMIN EMAIL - QR PAYMENT APPROVED
    // ============================================================

    await sendEmail({
      to: process.env.ADMIN_EMAIL,

      subject: `QR Payment Approved: ${booking.contactName} — ₹${paymentAmount.toLocaleString(
        "en-IN",
      )}`,

      html: adminPaymentAlertEmail(booking, paymentAmount, "approved", payment),

      attachments: payment.receiptAttachment
        ? [
            {
              filename: "payment-receipt",
              path: payment.receiptAttachment,
            },
          ]
        : [],
    });

    // ============================================================
    // REMOVE ORIGINAL QR PAYMENT NOTIFICATION
    // ============================================================

    await Notification.updateMany(
      {
        booking: booking._id,
        payment: payment._id,
        type: "qr_payment",
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          status: "read",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "QR payment approved successfully",
      booking,
    });
  } catch (error) {
    console.error("Approve QR payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve QR payment",
      error: error.message,
    });
  }
};
const rejectQRPayment = async (req, res) => {
  try {
    const { id, paymentId } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be modified for payments.",
      });
    }

    const payment = booking.paymentHistory.id(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been processed",
      });
    }

    payment.status = "failed";

    await booking.save();
    // ============================================================
    // CUSTOMER EMAIL - QR PAYMENT REJECTED
    // ============================================================

    if (booking.contactEmail) {
      await sendEmail({
        to: booking.contactEmail,

        subject: "QR Payment Rejected | KD Utsav Lawn",

        html: paymentReceiptEmail(
          booking,
          Number(payment.amount || 0),
          "qr_rejected",
          payment,
        ),

        attachments: payment.receiptAttachment
          ? [
              {
                filename: "payment-receipt",
                path: payment.receiptAttachment,
              },
            ]
          : [],
      });
    }

    // ============================================================
    // ADMIN EMAIL - QR PAYMENT REJECTED
    // ============================================================

    await sendEmail({
      to: process.env.ADMIN_EMAIL,

      subject: `QR Payment Rejected: ${booking.contactName} — ₹${Number(
        payment.amount || 0,
      ).toLocaleString("en-IN")}`,

      html: adminPaymentAlertEmail(
        booking,
        Number(payment.amount || 0),
        "rejected",
        payment,
      ),

      attachments: payment.receiptAttachment
        ? [
            {
              filename: "payment-receipt",
              path: payment.receiptAttachment,
            },
          ]
        : [],
    });

    // ============================================================
    // REMOVE ORIGINAL QR PAYMENT NOTIFICATION
    // ============================================================

    await Notification.updateMany(
      {
        booking: booking._id,
        payment: payment._id,
        type: "qr_payment",
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          status: "read",
        },
      },
    );
    return res.status(200).json({
      success: true,
      message: "QR payment rejected",
      booking,
    });
  } catch (error) {
    console.error("Reject QR payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject QR payment",
      error: error.message,
    });
  }
};

const updateBookingDiscount = async (req, res) => {
  try {
    const { discountAmount } = req.body;

    const discount = Number(discountAmount);

    if (!Number.isFinite(discount) || discount < 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid discount amount",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Confirm the booking before editing discount",
      });
    }

    const originalAmount = Number(
      booking.originalAmount ?? booking.totalAmount ?? 0,
    );

    if (
      !Number.isFinite(originalAmount) ||
      originalAmount < 0 ||
      discount > originalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed the original amount",
      });
    }

    const payableAmount = originalAmount - discount;
    const alreadyPaid = Number(booking.advanceAmount || 0);

    // Do not allow a discount that makes the bill
    // smaller than the amount already collected.
    if (payableAmount < alreadyPaid) {
      return res.status(400).json({
        success: false,
        message:
          "Discount cannot make the payable amount less than the amount already paid",
      });
    }

    booking.originalAmount = originalAmount;
    booking.discountAmount = discount;
    booking.payableAmount = payableAmount;
    booking.totalAmount = payableAmount;
    booking.remainingAmount = payableAmount - alreadyPaid;

    booking.paymentStatus =
      booking.remainingAmount === 0
        ? "fully_paid"
        : alreadyPaid > 0
          ? "advance_paid"
          : "unpaid";

    await booking.save();

    return res.json({
      success: true,
      message: "Discount saved successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking discount error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update discount",
      error: error.message,
    });
  }
};

// ADMIN - PREVIEW / DOWNLOAD EXISTING INVOICE PDF
const getAdminBookingInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("package", "name price")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Reuse the SAME invoice generator used in customer emails
    const invoicePdf = await createInvoicePdf(booking);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="KD-Utsav-Invoice-${booking.bookingNumber || booking._id}.pdf"`,
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(invoicePdf);
  } catch (error) {
    console.error("Admin invoice generation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice PDF",
    });
  }
};

module.exports = {
  createBooking,
  createWalkInBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  trackBookingByPhone,
  getBookedDates,
  submitQRPayment,
  approveQRPayment,
  rejectQRPayment,
  getBookingById,
  getAdminBookingById,
  createPaymentOrder,
  verifyPayment,
  deleteBooking,
  addManualPayment,
  updateBookingDiscount,
  getAdminBookingInvoice,
};
