const mongoose = require("mongoose");

/**
 * BrowsingHistory — time-decayed per-user category interest tracking.
 * TTL index automatically purges entries older than 30 days.
 * One document per user-category pair; viewCount reflects recency-weighted interest.
 */
const BrowsingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  viewCount: { type: Number, default: 1 },
  lastViewedAt: { type: Date, default: Date.now },
});

// Dedup: one doc per user-category
BrowsingHistorySchema.index({ userId: 1, category: 1 }, { unique: true });
// TTL: auto-purge after 30 days of no activity
BrowsingHistorySchema.index({ lastViewedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("BrowsingHistory", BrowsingHistorySchema);
