const express = require("express");
const router  = express.Router();
const {
  getHomeContent, getSectionContent, getAllContent, upsertContent,
  getTestimonials, getAllTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
} = require("../controllers/contentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadContent } = require("../config/cloudinary");

// Public
router.get("/home",          getHomeContent);
router.get("/testimonials",  getTestimonials);
router.get("/:section",      getSectionContent);

// Admin - content sections
router.get("/admin/all",     protect, adminOnly, getAllContent);
router.put("/admin/:section", protect, adminOnly, uploadContent.single("image"), upsertContent);

// Admin - testimonials
router.get("/admin/testimonials",       protect, adminOnly, getAllTestimonials);
router.post("/admin/testimonials",      protect, adminOnly, uploadContent.single("image"), addTestimonial);
router.put("/admin/testimonials/:id",   protect, adminOnly, updateTestimonial);
router.delete("/admin/testimonials/:id",protect, adminOnly, deleteTestimonial);

module.exports = router;
