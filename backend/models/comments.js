// const mongoose = require("mongoose");

// const issueSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, minlength: 5 },
//     description: { type: String, required: true, minlength: 10 },
//     imageUrl: { type: String },
//     location: {
//       lat: Number,
//       lng: Number,
//       city: String,
//       state: String,
//     },
//     category: { type: String, required: true },
//     severity: {
//       type: String,
//       enum: ["Low", "Medium", "High", "Critical"],
//       default: "Low",
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Working", "Done"],
//       default: "Pending",
//     },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

//     // ✅ Add Comments Section
//     comments: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: { type: String, required: true },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Issue", issueSchema);
