const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoute = require("./routes/userRoute");
const issueRoutes = require("./routes/issueRoute");
const adminRoutes = require("./routes/adminRoute");
const chatRoute = require("./routes/chatRoute");
const cors = require("cors");

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://issue-tracker-qy4t.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Routes
app.use("/issues", issueRoutes);
app.use("/user", userRoute);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoute);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Issue Tracker Backend is running!"
  });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Database connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 9000;

  app.listen(PORT, () => {
    console.log(`✅ Server is running on: ${PORT}`);
  });
}

// Vercel
module.exports = app;