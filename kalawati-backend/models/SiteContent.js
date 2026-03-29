const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      // e.g. "hero", "about", "testimonial_1", "contact", "whyus"
      required: true,
      unique: true,
      trim: true,
    },
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String },
    publicId: { type: String },
    buttonText: { type: String, trim: true },
    buttonLink: { type: String, trim: true },
    isVisible: { type: Boolean, default: true },
    extraData: {
      // Any flexible JSON data (e.g. features list, contact info)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
