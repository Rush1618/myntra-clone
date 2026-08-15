const mongoose = require("mongoose");

const notificationJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Object },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  retryCount: { type: Number, default: 0 },
  nextAttempt: { type: Date, default: Date.now },
  expoPushToken: { type: String }, // cached for speed
  createdAt: { type: Date, default: Date.now }
});

notificationJobSchema.index({ status: 1, nextAttempt: 1 }); // Optimized for polling

module.exports = mongoose.model("NotificationJob", notificationJobSchema);
