const NotificationJob = require("../models/NotificationJob");
const AuditLog = require("../models/AuditLog");
const { sendPushToUser } = require("../utils/sendPushNotification");

const MAX_RETRIES = 3;
const POLL_INTERVAL = 5000; // 5 seconds

async function processPendingJobs() {
  try {
    // Find up to 50 pending/failed jobs whose nextAttempt <= now
    const jobs = await NotificationJob.find({
      status: { $in: ["pending", "failed"] },
      nextAttempt: { $lte: new Date() },
      retryCount: { $lt: MAX_RETRIES }
    }).limit(50);

    for (const job of jobs) {
      try {
        await sendPushToUser(job.userId, {
          title: job.title,
          body: job.body,
          data: job.data
        });
        
        job.status = "sent";
        await job.save();
      } catch (err) {
        job.retryCount += 1;
        const permanentlyFailed = job.retryCount >= MAX_RETRIES;
        job.status = permanentlyFailed ? "failed" : "pending";
        // Exponential backoff: 2min, 4min, 8min
        job.nextAttempt = new Date(Date.now() + Math.pow(2, job.retryCount) * 60000);
        await job.save();
        console.error(`Failed to send notification job ${job._id}:`, err.message);

        // Audit trail: record permanent failure
        if (permanentlyFailed) {
          try {
            await AuditLog.create({
              entityType: "NotificationJob",
              entityId: job._id,
              event: "failed",
              metadata: { reason: err.message, userId: job.userId, title: job.title, retryCount: job.retryCount },
              performedBy: "system",
            });
          } catch (_) {}
        }
      }
    }
  } catch (error) {
    console.error("Error polling NotificationJobs:", error);
  } finally {
    setTimeout(processPendingJobs, POLL_INTERVAL);
  }
}

// Start worker
processPendingJobs();

module.exports = { processPendingJobs };
