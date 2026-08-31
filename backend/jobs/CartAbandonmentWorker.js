const Bag = require("../models/Bag");
const NotificationJob = require("../models/NotificationJob");

const POLL_INTERVAL_MS = 30 * 60 * 1000;  // 30 minutes
const ABANDONMENT_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 1 notification per user per 24h

/**
 * CartAbandonmentWorker
 *
 * Scheduled push notification for cart abandonment.
 *
 * Algorithm:
 *  1. Find all Bag documents that are active (savedForLater=false),
 *     where updatedAt is more than 1 hour ago (user hasn't touched cart).
 *  2. Group by userId (distinct).
 *  3. For each user, check if we already sent an abandonment notification
 *     in the last 24h (to prevent spam).
 *  4. If not, enqueue a NotificationJob reminder.
 */
async function processCartAbandonment() {
  try {
    const cutoff = new Date(Date.now() - ABANDONMENT_THRESHOLD_MS);
    const rateLimitCutoff = new Date(Date.now() - RATE_LIMIT_MS);

    // Find distinct users with idle active cart items
    const abandonedCarts = await Bag.aggregate([
      {
        $match: {
          savedForLater: false,
          updatedAt: { $lt: cutoff },
        },
      },
      {
        $group: {
          _id: "$userId",
          itemCount: { $sum: 1 },
          oldestItem: { $min: "$updatedAt" },
        },
      },
    ]);

    for (const cart of abandonedCarts) {
      const userId = cart._id;

      // Rate-limit check: skip if we already sent a reminder in the last 24h
      const recentReminder = await NotificationJob.findOne({
        userId,
        title: "Your cart is waiting! 🛍️",
        createdAt: { $gt: rateLimitCutoff },
      });

      if (recentReminder) continue;

      // Enqueue the cart abandonment notification
      await NotificationJob.create({
        userId,
        title: "Your cart is waiting! 🛍️",
        body: `You have ${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""} in your bag. Complete your purchase before they sell out!`,
        data: { screen: "bag" },
      });
    }
  } catch (err) {
    console.error("CartAbandonmentWorker error:", err.message);
  } finally {
    setTimeout(processCartAbandonment, POLL_INTERVAL_MS);
  }
}

// Start worker only when executed directly or in standalone server mode (not Vercel serverless)
if (process.env.VERCEL !== "1" && require.main === module) {
  processCartAbandonment();
}

module.exports = { processCartAbandonment };
