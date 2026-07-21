import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    where: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        entityType: {
          type: String,
          required: true,
        },
      },
    ],
    what: {
      type: { type: String, required: true },
      description: { type: String },
      metadata: mongoose.Schema.Types.Mixed,
    },
    byWho: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String },
      ipAddress: { type: String },
    },
    violationLevel: {
      type: Number, // 1 =Lower value number Highest severity
      required: true,
    },
  },
  { timestamps: true },
);

const Violation = mongoose.model("Violation", violationSchema);
export default Violation;
