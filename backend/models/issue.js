const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },

    // Manual Location
    location: {
      lat: {
        type: Number,
        required: false,
      },

      lng: {
        type: Number,
        required: false,
      },

      address: {
        type: String,
        default: "Unknown location",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Working", "Done"],
      default: "Pending",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    category: {
      type: String,
      enum: [
        "Road",
        "Electricity",
        "Water",
        "Garbage",
        "Public Safety",
        "Other",
      ],
      default: "Other",
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        text: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    resolvedAt: {
      type: Date,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);