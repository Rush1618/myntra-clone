const mongoose = require("mongoose");

const BagItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    /**
     * savedForLater — when true, item appears in "Saved for Later" section.
     * Only active (false) items contribute to cart total and proceed to checkout.
     */
    savedForLater: { type: Boolean, default: false },
    /**
     * priceSnapshot — price at time of adding to cart.
     * Used to detect price changes before checkout.
     */
    priceSnapshot: { type: Number },
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Compound index for deduplication queries and cart fetch
BagItemSchema.index({ userId: 1, productId: 1, size: 1, savedForLater: 1 });

module.exports = mongoose.model("Bag", BagItemSchema);
