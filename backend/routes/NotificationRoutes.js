const express = require("express");
const DeviceToken = require("../models/DeviceToken");
const router = express.Router();

/**
 * POST /notifications/register
 * Register or update a device push token for a user.
 * Uses upsert so re-registering the same token updates the userId (e.g., after re-login).
 */
router.post("/register", async (req, res) => {
  const { userId, token, platform } = req.body;

  if (!userId || !token || !platform) {
    return res.status(400).json({ message: "userId, token, and platform are required" });
  }

  try {
    await DeviceToken.findOneAndUpdate(
      { token },
      { userId, token, platform, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: "Token registered successfully" });
  } catch (err) {
    console.error("Token registration error:", err);
    res.status(500).json({ message: "Failed to register token" });
  }
});

/**
 * DELETE /notifications/token/:token
 * Deactivate an invalid/expired device token.
 * Called by the push sender when Expo returns DeviceNotRegistered error.
 */
router.delete("/token/:token", async (req, res) => {
  try {
    await DeviceToken.findOneAndUpdate(
      { token: req.params.token },
      { isActive: false }
    );
    res.status(200).json({ message: "Token deactivated" });
  } catch (err) {
    console.error("Token deactivation error:", err);
    res.status(500).json({ message: "Failed to deactivate token" });
  }
});

module.exports = router;
