const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const BrowsingHistory = require("../models/BrowsingHistory");
const mongoose = require("mongoose");

const router = express.Router();
const MAX_RECENTLY_VIEWED = 20;

const getTimestamp = (entry) => {
  const timestamp = new Date(entry.viewedAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeEntries = (entries = []) => {
  const merged = new Map();

  entries.forEach((entry) => {
    const productId = entry?.productId?._id?.toString?.() ?? entry?.productId?.toString?.() ?? entry?.productId;
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

const updateHistoryAtomically = async (userId, updaterFn) => {
  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;
      user.recentlyViewed = updaterFn(user.recentlyViewed || []);
      await user.save();
      return user;
    } catch (err) {
      if (err.name === "VersionError") {
        attempt++;
        if (attempt >= maxRetries) throw err;
      } else {
        throw err;
      }
    }
  }
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
    const objectId = new mongoose.Types.ObjectId(productId);
    
    // Atomic update with retry to prevent race conditions on cross-device sync
    const updatedUser = await updateHistoryAtomically(req.params.userid, (current) => {
      return mergeHistory(current, [{ productId: objectId, viewedAt }]);
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

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
    const updatedUser = await updateHistoryAtomically(req.params.userid, (current) => {
      return mergeHistory(current, incomingEntries);
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

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