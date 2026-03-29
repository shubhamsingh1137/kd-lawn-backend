const SiteContent  = require("../models/SiteContent");
const Testimonial  = require("../models/Testimonial");
const { cloudinary } = require("../config/cloudinary");

// @desc  Get all visible site content (used by homepage)
// @route GET /api/content/home
// @access Public
const getHomeContent = async (req, res) => {
  const content = await SiteContent.find({ isVisible: true });
  // Convert array to object keyed by section name for easy frontend use
  const contentMap = {};
  content.forEach((c) => (contentMap[c.section] = c));
  res.json({ success: true, content: contentMap });
};

// @desc  Get single section content
// @route GET /api/content/:section
// @access Public
const getSectionContent = async (req, res) => {
  const content = await SiteContent.findOne({ section: req.params.section });
  if (!content) return res.status(404).json({ success: false, message: "Section not found" });
  res.json({ success: true, content });
};

// @desc  Get all content (admin)
// @route GET /api/content/admin/all
// @access Admin
const getAllContent = async (req, res) => {
  const content = await SiteContent.find().sort("section");
  res.json({ success: true, content });
};

// @desc  Create or update content section
// @route PUT /api/content/admin/:section
// @access Admin
const upsertContent = async (req, res) => {
  const { section } = req.params;
  const updateData = { ...req.body };

  // If new image uploaded
  if (req.file) {
    // Delete old image from Cloudinary if exists
    const existing = await SiteContent.findOne({ section });
    if (existing?.publicId) {
      await cloudinary.uploader.destroy(existing.publicId);
    }
    updateData.imageUrl  = req.file.path;
    updateData.publicId  = req.file.filename;
  }

  const content = await SiteContent.findOneAndUpdate(
    { section },
    { $set: updateData },
    { new: true, upsert: true }
  );

  res.json({ success: true, message: "Content updated", content });
};

// ---- TESTIMONIALS ----

// @desc  Get all visible testimonials
// @route GET /api/content/testimonials
// @access Public
const getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find({ isVisible: true }).sort("sortOrder -createdAt");
  res.json({ success: true, testimonials });
};

// @desc  Admin - get all testimonials
// @route GET /api/content/admin/testimonials
// @access Admin
const getAllTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find().sort("-createdAt");
  res.json({ success: true, testimonials });
};

// @desc  Add testimonial
// @route POST /api/content/admin/testimonials
// @access Admin
const addTestimonial = async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.imageUrl = req.file.path;
    data.publicId = req.file.filename;
  }
  const testimonial = await Testimonial.create(data);
  res.status(201).json({ success: true, message: "Testimonial added", testimonial });
};

// @desc  Update testimonial
// @route PUT /api/content/admin/testimonials/:id
// @access Admin
const updateTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Testimonial updated", testimonial });
};

// @desc  Delete testimonial
// @route DELETE /api/content/admin/testimonials/:id
// @access Admin
const deleteTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: "Not found" });
  if (testimonial.publicId) await cloudinary.uploader.destroy(testimonial.publicId);
  await testimonial.deleteOne();
  res.json({ success: true, message: "Testimonial deleted" });
};

module.exports = {
  getHomeContent, getSectionContent, getAllContent, upsertContent,
  getTestimonials, getAllTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
};
