const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "leave_applied",
        "leave_approved",
        "leave_rejected",
        "substitute_assigned",
        "leave_cancelled",
        "ai_alert",
      ],
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedLeave: { type: mongoose.Schema.Types.ObjectId, ref: "Leave" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
