const User = require("../models/user");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // set by auth middleware
    const user = await User.findById(userId)
      .select("-password") // hide password
      .populate("issuesReported"); // include issues

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
