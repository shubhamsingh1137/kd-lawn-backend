const express = require("express");
const router  = express.Router();
const {
  getAllUsers, toggleBlockUser, deleteUser, updateProfile, changePassword,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Logged-in user
router.put("/profile",         protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin
router.get("/admin/all",          protect, adminOnly, getAllUsers);
router.patch("/admin/:id/block",  protect, adminOnly, toggleBlockUser);
router.delete("/admin/:id",       protect, adminOnly, deleteUser);

module.exports = router;
