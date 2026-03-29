const express = require("express");
const router  = express.Router();
const {
  getGallery, getAllGallery, uploadImage, updateImage, deleteImage,
} = require("../controllers/galleryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadGallery } = require("../config/cloudinary");

// Public
router.get("/", getGallery);

// Admin
router.get("/admin/all",       protect, adminOnly, getAllGallery);
router.post("/admin",          protect, adminOnly, uploadGallery.single("image"), uploadImage);
router.put("/admin/:id",       protect, adminOnly, updateImage);
router.delete("/admin/:id",    protect, adminOnly, deleteImage);

module.exports = router;
