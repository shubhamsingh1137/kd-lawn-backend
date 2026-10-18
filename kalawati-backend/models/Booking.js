const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    eventType: {
      type: String,
      enum: [
        "Wedding",
        "Reception",
        "Engagement",
        "Birthday",
        "Corporate",
        "Other",
      ],
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    guestCount: {
      type: Number,
      required: [true, "Guest count is required"],
      min: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Original booking amount before discount
    originalAmount: {
      type: Number,
      min: 0,
    },

    // Discount applied by admin
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final amount after discount
    payableAmount: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    advanceAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "advance_paid", "fully_paid"],
      default: "unpaid",
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
          min: 1,
        },

        // Payment source
        source: {
          type: String,
          enum: ["razorpay", "manual"],
          default: "razorpay",
        },

        // Manual payment method
        paymentMethod: {
          type: String,
          enum: ["cash", "upi", "bank_transfer", "card", "other", "razorpay"],
        },

        // Person who received manual payment
        collectedBy: {
          type: String,
          trim: true,
        },

        // Manual transaction/reference number
        transactionId: {
          type: String,
          trim: true,
        },

        // Admin note
        note: {
          type: String,
          trim: true,
        },

        // Receipt/proof URL
        receiptAttachment: {
          type: String,
        },

        // Razorpay fields
        razorpayOrderId: {
          type: String,
        },

        razorpayPaymentId: {
          type: String,
        },

        razorpaySignature: {
          type: String,
        },

        paidAt: {
          type: Date,
          default: Date.now,
        },

        status: {
          type: String,
          enum: ["pending", "success", "failed"],
          default: "success",
        },
      },
    ],

    specialRequests: { type: String, trim: true },
    adminNote: { type: String, trim: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactAddress: {
      type: String,
      trim: true,
      default: "",
    },
    contactEmail: { type: String },
    // Booking source: online website or admin walk-in
    bookingSource: {
      type: String,
      enum: ["online", "walk_in"],
      default: "online",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
