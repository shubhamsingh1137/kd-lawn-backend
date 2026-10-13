const Notification = require("../models/Notification");

// =========================================================
// GET ADMIN NOTIFICATIONS
// =========================================================

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isDeleted: false,
    })
      .populate("booking", "_id contactName contactPhone contactEmail")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      isDeleted: false,
      status: "unread",
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// =========================================================
// MARK SINGLE NOTIFICATION AS READ
// =========================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "read";

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        isDeleted: false,
        status: "unread",
      },
      {
        $set: {
          status: "read",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

// =========================================================
// DELETE NOTIFICATION
// =========================================================

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isDeleted = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
