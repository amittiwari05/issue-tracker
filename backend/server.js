const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoute = require("./routes/userRoute");
const issueRoutes = require("./routes/issueRoute");
const adminRoutes = require('./routes/adminRoute');
const chatRoute = require('./routes/chatRoute');   // ✅ Seva Bot chat route
const cors = require("cors");

const app = express();

// ✅ Enable CORS for frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://issue-tracker-weld-two.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Increase payload limit (to handle large image or base64 data)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ Register routes
app.use("/issues", issueRoutes);
app.use("/user", userRoute);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoute);              // ✅ Seva Bot — POST /chat

// ✅ MongoDB + Server connection
const PORT = process.env.PORT || 9000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server is running on: ${PORT}`));
    console.log("✅ Database connected");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
