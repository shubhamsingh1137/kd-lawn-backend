const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
      required: true,
    },
    category: {
      type: String,
      enum: ["wedding", "reception", "decoration", "food", "venue", "other"],
      default: "venue",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
