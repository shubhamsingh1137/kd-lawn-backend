const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");

// Public website: fetch announcements currently eligible to display
const getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      isEnabled: true,
      $and: [
        {
          $or: [
            { startsAt: null },
            { startsAt: { $exists: false } },
            { startsAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { endsAt: null },
            { endsAt: { $exists: false } },
            { endsAt: { $gt: now } },
          ],
        },
      ],
    }).sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, announcements });
  } catch (error) {
    console.error("Get active announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// Admin: fetch all announcements, including disabled ones
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({
      createdAt: -1,
    });

    res.json({ success: true, announcements });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// Admin: create announcement
const createAnnouncement = async (req, res) => {
  try {
    const {
      message,
      isEnabled,
      backgroundColor,
      textColor,
      speed,
      direction,
      startsAt,
      endsAt,
      priority,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement message is required",
      });
    }

    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date",
      });
    }

    const announcement = await Announcement.create({
      message: message.trim(),
      isEnabled: isEnabled ?? true,
      backgroundColor,
      textColor,
      speed,
      direction,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// Admin: edit announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const {
      message,
      isEnabled,
      backgroundColor,
      textColor,
      speed,
      direction,
      startsAt,
      endsAt,
      priority,
    } = req.body;

    if (message !== undefined && !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement message cannot be empty",
      });
    }

    const current = await Announcement.findById(id);

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const nextStart =
      startsAt === undefined ? current.startsAt : startsAt || null;

    const nextEnd = endsAt === undefined ? current.endsAt : endsAt || null;

    if (nextStart && nextEnd && new Date(nextStart) >= new Date(nextEnd)) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date",
      });
    }

    const updates = {};

    if (message !== undefined) updates.message = message.trim();
    if (isEnabled !== undefined) updates.isEnabled = isEnabled;
    if (backgroundColor !== undefined)
      updates.backgroundColor = backgroundColor;
    if (textColor !== undefined) updates.textColor = textColor;
    if (speed !== undefined) updates.speed = speed;
    if (direction !== undefined) updates.direction = direction;
    if (startsAt !== undefined) updates.startsAt = startsAt || null;
    if (endsAt !== undefined) updates.endsAt = endsAt || null;
    if (priority !== undefined) updates.priority = priority;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

// Admin: enable/disable
const toggleAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.isEnabled = !announcement.isEnabled;
    await announcement.save();

    res.json({
      success: true,
      message: announcement.isEnabled
        ? "Announcement enabled"
        : "Announcement disabled",
      announcement,
    });
  } catch (error) {
    console.error("Toggle announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change announcement status",
    });
  }
};

// Admin: delete
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

module.exports = {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
};
