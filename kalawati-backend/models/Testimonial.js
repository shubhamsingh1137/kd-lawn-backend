const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
    rating:    { type: Number, min: 1, max: 5, default: 5 },
    imageUrl:  { type: String },
    publicId:  { type: String },
    eventType: { type: String, trim: true },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
