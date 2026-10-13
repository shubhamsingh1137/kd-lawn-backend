const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

// =========================================================
// ADMIN NOTIFICATIONS
// =========================================================

// Get all notifications
router.get("/", getNotifications);

// IMPORTANT: read-all MUST come before :id/read
router.patch("/read-all", markAllNotificationsAsRead);

// Mark one notification as read
router.patch("/:id/read", markNotificationAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
