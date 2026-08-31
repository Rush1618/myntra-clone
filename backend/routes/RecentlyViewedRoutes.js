const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const BrowsingHistory = require("../models/BrowsingHistory");

const router = express.Router();
const MAX_RECENTLY_VIEWED = 20;

const getTimestamp = (entry) => {
  const timestamp = new Date(entry.viewedAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeEntries = (entries = []) => {
  const merged = new Map();

  entries.forEach((entry) => {
    const productId = entry?.productId?.toString?.() ?? entry?.productId;
    if (!productId) {
      return;
    }

    const candidate = {
      productId,
      viewedAt: entry.viewedAt ? new Date(entry.viewedAt) : new Date(),
    };

    const current = merged.get(productId);
    if (!current || getTimestamp(candidate) >= getTimestamp(current)) {
      merged.set(productId, candidate);
    }
  });

  return Array.from(merged.values())
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, MAX_RECENTLY_VIEWED);
};

const mergeHistory = (existingEntries = [], incomingEntries = []) => {
  return normalizeEntries([...existingEntries, ...incomingEntries]);
};

router.get("/:userid", async (req, res) => {
  try {
    const user = await User.findById(req.params.userid).populate(
      "recentlyViewed.productId"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.recentlyViewed ?? []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/:userid/view", async (req, res) => {
  const { productId, viewedAt } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required" });

  try {
    const mongoose = require("mongoose");
    const objectId = new mongoose.Types.ObjectId(productId);

    // Step 1: Remove any existing entry for this product (atomic dedup)
    await User.findByIdAndUpdate(req.params.userid, {
      $pull: { recentlyViewed: { productId: objectId } },
    });

    // Step 2: Prepend fresh entry and cap at 20 (atomic, no race condition)
    const updated = await User.findByIdAndUpdate(
      req.params.userid,
      {
        $push: {
          recentlyViewed: {
            $each: [{ productId: objectId, viewedAt: viewedAt ? new Date(viewedAt) : new Date() }],
            $position: 0,
            $slice: 20,
          },
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    // Record browsing history with strict 50-item limit per user and increment viewCount
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate("category", "name");

      if (product) {
        const catName = product.categoryName || product.category?.name || "General";
        const catId = product.category?._id || product.category;

        // Upsert unique product view for user
        await BrowsingHistory.findOneAndUpdate(
          { userId: req.params.userid, productId },
          {
            userId: req.params.userid,
            productId,
            category: catName,
            categoryRef: catId,
            viewedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        // Enforce maximum 50 unique views per user
        const totalViews = await BrowsingHistory.countDocuments({ userId: req.params.userid });
        if (totalViews > 50) {
          const excess = totalViews - 50;
          const oldestRecords = await BrowsingHistory.find({ userId: req.params.userid })
            .sort({ viewedAt: 1 })
            .limit(excess)
            .select("_id");
          if (oldestRecords.length > 0) {
            await BrowsingHistory.deleteMany({ _id: { $in: oldestRecords.map((r) => r._id) } });
          }
        }
      }
    } catch (histErr) {
      console.error("BrowsingHistory upsert failed (non-fatal):", histErr.message);
    }

    const populated = await User.findById(req.params.userid).populate(
      "recentlyViewed.productId"
    );

    res.status(200).json(populated?.recentlyViewed ?? []);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/:userid/merge", async (req, res) => {
  const incomingEntries = Array.isArray(req.body?.items) ? req.body.items : [];

  try {
    const user = await User.findById(req.params.userid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.recentlyViewed = mergeHistory(user.recentlyViewed, incomingEntries);
    await user.save();

    const populated = await User.findById(req.params.userid).populate(
      "recentlyViewed.productId"
    );

    res.status(200).json(populated.recentlyViewed ?? []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;