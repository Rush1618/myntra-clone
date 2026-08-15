const mongoose = require("mongoose");

/**
 * AuditLog — immutable event trail for key entity changes.
 * Records order creation, failure, refund, etc. for compliance and debugging.
 */
const AuditLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true },              // e.g. "Order"
  entityId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  event:      { type: String, required: true },              // "created" | "failed" | "refunded"
  metadata:   mongoose.Schema.Types.Mixed,                   // arbitrary event context
  performedBy: String,                                        // userId or "system"
  timestamp:  { type: Date, default: Date.now },
});

// Indexed for fast lookup by entity (e.g. "all events for Order X")
AuditLogSchema.index({ entityId: 1, entityType: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
