const express = require("express");
const router  = express.Router();
const {
  getPackages, getAllPackages, createPackage, updatePackage, deletePackage,
} = require("../controllers/packageController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/", getPackages);

// Admin
router.get("/admin/all",    protect, adminOnly, getAllPackages);
router.post("/admin",       protect, adminOnly, createPackage);
router.put("/admin/:id",    protect, adminOnly, updatePackage);
router.delete("/admin/:id", protect, adminOnly, deletePackage);

module.exports = router;
