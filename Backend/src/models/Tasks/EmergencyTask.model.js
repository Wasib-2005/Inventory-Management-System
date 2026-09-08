import mongoose from "mongoose";

const emergencyTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["high", "critical"], default: "high" },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "cancelled"],
      default: "open",
      index: true,
    },
    relatedType: { type: String, enum: ["movement", "cycle_count", "manual"], default: "manual" },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resolution: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

emergencyTaskSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("EmergencyTask", emergencyTaskSchema);
