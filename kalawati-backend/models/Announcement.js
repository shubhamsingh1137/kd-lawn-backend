const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      maxlength: 500,
    },

    isEnabled: {
      type: Boolean,
      default: true,
    },

    backgroundColor: {
      type: String,
      default: "#8B1E3F",
    },

    textColor: {
      type: String,
      default: "#FFFFFF",
    },

    speed: {
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },

    direction: {
      type: String,
      enum: ["left", "right"],
      default: "left",
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
