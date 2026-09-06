const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 🔒 Protect: verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user details from DB (reflects role/status changes)
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated. Contact admin." });
    }

    req.user = user; // attach user object to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 👮 Role-based authorization (Admin, User, etc.)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = { protect, authorize };
