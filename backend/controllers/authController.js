const cloudinary = require('../config/cloudinary')
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 🧩 Utility: Generate JWT Token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret key is missing in environment variables");
  }
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// 📝 SIGNUP Controller
const signup = async (req, res) => {
  try {
    const { name, email, password, role, profilePic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        success: false,
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let uploadedImageUrl =
      "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // If profilePic exists (base64 string from frontend)
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "civicEye/profiles",
      });
      uploadedImageUrl = uploadResponse.secure_url;
    }

    const newUser = new UserModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "user",
      profilePic: uploadedImageUrl,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

// 🔐 LOGIN Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Please contact admin.",
        success: false,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const jwtToken = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

module.exports = { signup, login };
