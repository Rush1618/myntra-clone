const mongoose = require("mongoose");

const DeviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["ios", "android", "web"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of active tokens per user
DeviceTokenSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("DeviceToken", DeviceTokenSchema);
