const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (req.user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been blocked" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (req.user?.isBlocked) {
          req.user = null;
        }
      }
    }
  } catch (error) {
    // Missing or invalid token: continue as a guest.
    req.user = null;
  }

  next();
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Admin access only" });
  }
};

module.exports = { protect, optionalAuth, adminOnly };
