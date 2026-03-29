const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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
      enum: ["Wedding", "Reception", "Engagement", "Birthday", "Corporate", "Other"],
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
    },
    advanceAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
