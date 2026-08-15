const express = require("express");
const Bag = require("../models/Bag");
const Product = require("../models/Product");
const router = express.Router();

/**
 * POST /bag
 * Add item to active cart.
 * Deduplication: if same product+size already in active cart, increment quantity.
 * Price snapshot: captures current price for later change detection.
 */
router.post("/", async (req, res) => {
  const { userId, productId, size, quantity = 1 } = req.body;

  if (!userId || !productId || !size) {
    return res.status(400).json({ message: "userId, productId, and size are required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Deduplication: increment if already in active cart
    const existing = await Bag.findOne({ userId, productId, size, savedForLater: false });
    if (existing) {
      existing.quantity += Number(quantity);
      await existing.save();
      return res.status(200).json(existing);
    }

    const item = await Bag.create({
      userId,
      productId,
      size,
      quantity: Number(quantity),
      savedForLater: false,
      priceSnapshot: product.price,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * GET /bag/:userid
 * Returns active cart items and saved-for-later items separately.
 * Active items include a priceChanged flag if price changed since adding.
 */
router.get("/:userid", async (req, res) => {
  try {
    const [activeItems, savedItems] = await Promise.all([
      Bag.find({ userId: req.params.userid, savedForLater: false }).populate("productId"),
      Bag.find({ userId: req.params.userid, savedForLater: true }).populate("productId"),
    ]);

    // Detect price changes for active cart items
    const activeWithPriceCheck = activeItems.map((item) => {
      const currentPrice = item.productId?.price;
      return {
        ...item.toObject(),
        priceChanged: currentPrice !== undefined && currentPrice !== item.priceSnapshot,
        currentPrice,
      };
    });

    res.status(200).json({ activeItems: activeWithPriceCheck, savedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * PATCH /bag/:itemid/save-for-later
 * Move an active cart item to the "Saved for Later" section.
 */
router.patch("/:itemid/save-for-later", async (req, res) => {
  try {
    const item = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { savedForLater: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * PATCH /bag/:itemid/move-to-bag
 * Move a saved item back to the active cart.
 * Returns priceChanged flag if price differs from snapshot.
 */
router.patch("/:itemid/move-to-bag", async (req, res) => {
  try {
    const item = await Bag.findById(req.params.itemid).populate("productId");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const currentPrice = item.productId?.price;
    const priceChanged = currentPrice !== undefined && currentPrice !== item.priceSnapshot;

    item.savedForLater = false;
    // Update snapshot to current price
    if (currentPrice !== undefined) {
      item.priceSnapshot = currentPrice;
    }
    await item.save();

    res.status(200).json({ item, priceChanged, currentPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * PATCH /bag/:itemid/quantity
 * Update quantity. Uses optimistic locking (via schema) — returns 409 on concurrent conflict.
 */
router.patch("/:itemid/quantity", async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || Number(quantity) < 1) {
    return res.status(400).json({ message: "quantity must be >= 1" });
  }

  try {
    const item = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { quantity: Number(quantity) },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    if (err.name === "VersionError") {
      return res.status(409).json({ message: "Concurrent update conflict — please retry" });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * DELETE /bag/:itemid
 * Remove item from bag (both active and saved).
 */
router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing item from bag" });
  }
});

module.exports = router;
