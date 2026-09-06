const User = require("../models/user");
const Issue = require("../models/issue");

// 🧍‍♂️ Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ Update user (admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent sensitive updates
    delete updates.password;
    delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User updated", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🗑️ Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Delete all issues created by the user
    await Issue.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: "User and their issues deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📋 Get all issues (admin)
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "name email role") // ✅ FIXED: match schema
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ Update issue (admin)
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email role");

    if (!updatedIssue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Issue updated", updatedIssue });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🗑️ Delete issue (admin)
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    res.status(200).json({ success: true, message: "Issue deleted" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
