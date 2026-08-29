const mongoose = require("mongoose");

/**
 * BrowsingHistory — Stores user product views server-side with a strict limit of
 * 50 unique views per user and automatic TTL expiration for outdated records (30 days).
 */
const BrowsingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  category: { type: String, default: "General" },
  categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  viewedAt: { type: Date, default: Date.now },
});

// Ensure 1 entry per user per product (unique view)
BrowsingHistorySchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for fast recency sorting per user
BrowsingHistorySchema.index({ userId: 1, viewedAt: -1 });

// Automatic expiration of outdated records: TTL 30 days
BrowsingHistorySchema.index({ viewedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("BrowsingHistory", BrowsingHistorySchema);
