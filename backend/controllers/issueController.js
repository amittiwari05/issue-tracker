const Issue = require("../models/issue");
const User = require("../models/user");
const mongoose = require("mongoose");

// 🟢 Create New Issue
const createIssue = async (req, res) => {
  try {
    const { title, description, imageUrl, location, severity, category } = req.body;

    // Validate required fields
    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and image are required",
      });
    }

    // Create new issue document
    const issue = new Issue({
      user: req.user._id,
      title,
      description,
      imageUrl,

      // Manual Location
      location: {
        address: location?.address || "Unknown location",
        city: location?.city || "",
        state: location?.state || "",
        country: location?.country || "India",
      },

      severity: severity || "Low",
      category: category || "Other",
    });

    await issue.save();

    // Add issue reference to user's document
    await User.findByIdAndUpdate(req.user._id, {
      $push: { issuesReported: issue._id },
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue,
    });
  } catch (err) {
    console.error("❌ Error creating issue:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      error: err.message,
    });
  }
};

// 🟡 Get All Issues
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "name email role profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (err) {
    console.error("❌ Error fetching issues:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching issues",
      error: err.message,
    });
  }
};

// 🔵 Get Single Issue by ID
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id)
      .populate("user", "name email role profilePic")
      .populate("comments.user", "name email role profilePic");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (err) {
    console.error("❌ Error fetching issue:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching issue",
      error: err.message,
    });
  }
};

// 🔼 Upvote Issue (toggle)
const upvoteIssue = async (req, res) => {
  try {
    const userId = req.user._id;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const hasUpvoted = issue.upvotes.includes(userId);
    const hasDownvoted = issue.downvotes.includes(userId);

    if (hasUpvoted) {
      issue.upvotes.pull(userId);
    } else {
      issue.upvotes.push(userId);

      if (hasDownvoted) {
        issue.downvotes.pull(userId);
      }
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Upvote status updated",
      upvotes: issue.upvotes.length,
      downvotes: issue.downvotes.length,
    });
  } catch (err) {
    console.error("❌ Error updating upvote:", err);

    res.status(500).json({
      success: false,
      message: "Error updating upvote",
      error: err.message,
    });
  }
};

// 🔽 Downvote Issue (toggle)
const downvoteIssue = async (req, res) => {
  try {
    const userId = req.user._id;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const hasUpvoted = issue.upvotes.includes(userId);
    const hasDownvoted = issue.downvotes.includes(userId);

    if (hasDownvoted) {
      issue.downvotes.pull(userId);
    } else {
      issue.downvotes.push(userId);

      if (hasUpvoted) {
        issue.upvotes.pull(userId);
      }
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Downvote status updated",
      upvotes: issue.upvotes.length,
      downvotes: issue.downvotes.length,
    });
  } catch (err) {
    console.error("❌ Error updating downvote:", err);

    res.status(500).json({
      success: false,
      message: "Error updating downvote",
      error: err.message,
    });
  }
};

// 💬 Add Comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.comments.push({
      user: req.user._id,
      text,
    });

    await issue.save();

    const populatedIssue = await Issue.findById(req.params.id)
      .populate("comments.user", "name profilePic");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: populatedIssue.comments,
    });
  } catch (err) {
    console.error("❌ Error adding comment:", err);

    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: err.message,
    });
  }
};

// 🧩 Admin: Update Issue Status (Pending → Working → Done)
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Working", "Done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updateFields = { status };

    if (status === "Done") {
      updateFields.resolvedAt = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      issue: updatedIssue,
    });
  } catch (err) {
    console.error("❌ Error updating issue status:", err);

    res.status(500).json({
      success: false,
      message: "Error updating issue status",
      error: err.message,
    });
  }
};

// 🔴 Delete Issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    // Find the issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Only owner or admin can delete
    if (
      issue.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this issue",
      });
    }

    // Delete issue
    await issue.deleteOne();

    // Remove from user's reported list
    await User.findByIdAndUpdate(issue.user, {
      $pull: { issuesReported: issue._id },
    });

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting issue:", err);

    res.status(500).json({
      success: false,
      message: "Error deleting issue",
      error: err.message,
    });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  upvoteIssue,
  downvoteIssue,
  addComment,
  updateIssueStatus,
  deleteIssue,
};