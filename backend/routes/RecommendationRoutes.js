const express = require("express");
const BrowsingHistory = require("../models/BrowsingHistory");
const Product = require("../models/Product");
const router = express.Router();

const MAX_RECS = 20;
const POPULARITY_FALLBACK_LIMIT = 20;

/**
 * GET /recommendations/:userId
 *
 * Returns personalized product recommendations based on browsing history.
 *
 * Algorithm:
 *  1. Fetch user's top-N categories by viewCount from BrowsingHistory.
 *  2. Find products in those categories (weighted by interest).
 *  3. Exclude already-viewed products to avoid recommending what they just saw.
 *  4. If <5 personalized results (cold-start), pad with global popularity fallback.
 *
 * Query params:
 *   limit    (default: 20)
 *   exclude  comma-separated productIds to exclude
 */
router.get("/:userId", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? MAX_RECS), 40);
  const excludeParam = req.query.exclude ? String(req.query.exclude).split(",") : [];

  try {
    // Step 1: Get top interest categories, sorted by viewCount
    const interests = await BrowsingHistory.find({ userId: req.params.userId })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("category viewCount");

    let recommendations = [];

    if (interests.length > 0) {
      // Step 2: Build weighted category query
      // Each category contributes proportional to its viewCount
      const totalViews = interests.reduce((s, i) => s + i.viewCount, 0);
      const budgetPerCategory = interests.map((i) => ({
        category: i.category,
        limit: Math.max(2, Math.round((i.viewCount / totalViews) * limit)),
      }));

      // Fetch products per category in parallel
      const productBatches = await Promise.all(
        budgetPerCategory.map(({ category, limit: catLimit }) =>
          Product.find({
            category,
            _id: { $nin: excludeParam },
          })
            .limit(catLimit)
            .select("_id name brand price images category discount")
            .lean()
        )
      );

      // Flatten + deduplicate by _id
      const seen = new Set(excludeParam);
      for (const batch of productBatches) {
        for (const p of batch) {
          if (!seen.has(String(p._id))) {
            seen.add(String(p._id));
            recommendations.push(p);
          }
        }
      }
    }

    // Step 3: Popularity-based cold-start fallback
    if (recommendations.length < 5) {
      const excludedIds = [
        ...excludeParam,
        ...recommendations.map((p) => String(p._id)),
      ];

      const popular = await Product.find({ _id: { $nin: excludedIds } })
        .sort({ viewCount: -1, discount: -1 })
        .limit(POPULARITY_FALLBACK_LIMIT)
        .select("_id name brand price images category discount viewCount")
        .lean();

      recommendations = [...recommendations, ...popular];
    }

    // Step 4: Trim to requested limit
    recommendations = recommendations.slice(0, limit);

    res.status(200).json({
      recommendations,
      meta: {
        personalized: interests.length > 0,
        topCategories: interests.map((i) => i.category),
        count: recommendations.length,
      },
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: "Could not generate recommendations" });
  }
});

module.exports = router;
