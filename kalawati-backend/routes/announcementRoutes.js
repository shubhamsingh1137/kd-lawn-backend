const express = require("express");
const router = express.Router();

const {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public: homepage can fetch active announcements
router.get("/active", getActiveAnnouncements);

// Admin-only routes
router.get("/admin/all", protect, adminOnly, getAllAnnouncements);
router.post("/admin", protect, adminOnly, createAnnouncement);
router.put("/admin/:id", protect, adminOnly, updateAnnouncement);
router.patch("/admin/:id/toggle", protect, adminOnly, toggleAnnouncement);
router.delete("/admin/:id", protect, adminOnly, deleteAnnouncement);

module.exports = router;
