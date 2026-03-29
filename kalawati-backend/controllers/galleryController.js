const Gallery  = require("../models/Gallery");
const { cloudinary } = require("../config/cloudinary");

// @desc  Get all visible gallery images
// @route GET /api/gallery
// @access Public
const getGallery = async (req, res) => {
  const { category } = req.query;
  const filter = { isVisible: true };
  if (category && category !== "all") filter.category = category;
  const images = await Gallery.find(filter).sort("sortOrder -createdAt");
  res.json({ success: true, images });
};

// @desc  Get all gallery images (admin)
// @route GET /api/gallery/admin/all
// @access Admin
const getAllGallery = async (req, res) => {
  const images = await Gallery.find().sort("sortOrder -createdAt");
  res.json({ success: true, images });
};

// @desc  Upload gallery image
// @route POST /api/gallery/admin
// @access Admin
const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No image uploaded" });

  const { title, category, sortOrder } = req.body;
  const image = await Gallery.create({
    title: title || "Gallery Image",
    imageUrl: req.file.path,
    publicId: req.file.filename || req.file.public_id,
    category: category || "venue",
    sortOrder: sortOrder || 0,
  });

  res.status(201).json({ success: true, message: "Image uploaded", image });
};

// @desc  Update gallery image (title, category, visibility)
// @route PUT /api/gallery/admin/:id
// @access Admin
const updateImage = async (req, res) => {
  const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!image) return res.status(404).json({ success: false, message: "Image not found" });
  res.json({ success: true, message: "Image updated", image });
};

// @desc  Delete gallery image
// @route DELETE /api/gallery/admin/:id
// @access Admin
const deleteImage = async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: "Image not found" });

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(image.publicId);
  await image.deleteOne();

  res.json({ success: true, message: "Image deleted" });
};

module.exports = { getGallery, getAllGallery, uploadImage, updateImage, deleteImage };
