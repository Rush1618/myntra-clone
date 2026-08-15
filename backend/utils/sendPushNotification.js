const axios = require("axios");
const DeviceToken = require("../models/DeviceToken");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100; // Expo API limit per request

/**
 * sendPushToUser — sends push notification to all active devices of a user.
 *
 * @param {string | import('mongoose').ObjectId} userId
 * @param {{ title: string, body: string, data?: Record<string, any> }} payload
 */
async function sendPushToUser(userId, { title, body, data = {} }) {
  const tokenDocs = await DeviceToken.find({ userId, isActive: true }).select("token");
  if (!tokenDocs.length) return;

  const messages = tokenDocs.map(({ token }) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  // Batch into chunks of 100 (Expo rate-limit per request)
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    try {
      const { data: result } = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      });

      // Automatically deactivate invalid tokens reported by Expo
      if (Array.isArray(result?.data)) {
        const invalidCleanups = result.data
          .map((ticket, idx) => ({ ticket, token: chunk[idx]?.to }))
          .filter(({ ticket }) => ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered")
          .map(({ token }) =>
            DeviceToken.findOneAndUpdate({ token }, { isActive: false })
          );
        await Promise.allSettled(invalidCleanups);
      }
    } catch (err) {
      // Non-fatal: log and continue — notification delivery is best-effort
      console.error(`Push batch [${i}–${i + chunk.length}] failed:`, err.message);
    }
  }
}

module.exports = { sendPushToUser };
