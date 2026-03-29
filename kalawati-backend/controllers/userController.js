const User = require("../models/User");

// @desc  Get all users (admin)
// @route GET /api/users/admin/all
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};
  const total = await User.countDocuments({ ...filter, role: "user" });
  const users = await User.find({ ...filter, role: "user" })
    .select("-password")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, users });
};

// @desc  Block / unblock user
// @route PATCH /api/users/admin/:id/block
const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot block admin" });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, user });
};

// @desc  Delete user
// @route DELETE /api/users/admin/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot delete admin" });
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
};

// @desc  Update own profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  ).select("-password");
  res.json({ success: true, message: "Profile updated", user });
};

// @desc  Change own password
// @route PUT /api/users/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
};

module.exports = { getAllUsers, toggleBlockUser, deleteUser, updateProfile, changePassword };
