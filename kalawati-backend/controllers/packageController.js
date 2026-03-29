const Package = require("../models/Package");

// @desc  Get all active packages
// @route GET /api/packages
// @access Public
const getPackages = async (req, res) => {
  const packages = await Package.find({ isActive: true }).sort("sortOrder price");
  res.json({ success: true, packages });
};

// @desc  Admin - get all packages
// @route GET /api/packages/admin/all
// @access Admin
const getAllPackages = async (req, res) => {
  const packages = await Package.find().sort("sortOrder");
  res.json({ success: true, packages });
};

// @desc  Create package
// @route POST /api/packages/admin
// @access Admin
const createPackage = async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json({ success: true, message: "Package created", package: pkg });
};

// @desc  Update package
// @route PUT /api/packages/admin/:id
// @access Admin
const updatePackage = async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
  res.json({ success: true, message: "Package updated", package: pkg });
};

// @desc  Delete package
// @route DELETE /api/packages/admin/:id
// @access Admin
const deletePackage = async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
  res.json({ success: true, message: "Package deleted" });
};

module.exports = { getPackages, getAllPackages, createPackage, updatePackage, deletePackage };
