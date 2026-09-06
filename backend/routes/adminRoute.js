const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllIssues,
  updateIssue,
  deleteIssue,
} = require("../controllers/adminController");

// ✅ All routes require admin access
router.use(protect, authorize("admin"));

// 👥 User management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// 📌 Issue management
router.get("/issues", getAllIssues);
router.put("/issues/:id", updateIssue);
router.delete("/issues/:id", deleteIssue);

module.exports = router;
