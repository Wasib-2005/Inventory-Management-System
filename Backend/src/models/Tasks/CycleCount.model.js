import mongoose from "mongoose";

const cycleCountSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    notes: { type: String, trim: true },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    countedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rackScope: { type: String, enum: ["all", "specific"], required: true },
    racks: [
      {
        rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack", required: true },
        rackCode: { type: String, trim: true },
        shelfScope: { type: String, enum: ["all", "one"], required: true },
        shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
        shelfCode: { type: String, trim: true },
      },
    ],
    discrepancies: [
      {
        description: { type: String, required: true, trim: true },
        expectedQty: { type: Number, min: 0 },
        actualQty: { type: Number, min: 0 },
        rackCode: { type: String, trim: true },
        shelfCode: { type: String, trim: true },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
        index: true,
      },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
      note: { type: String, trim: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

cycleCountSchema.index({ warehouseId: 1, createdAt: -1 });

const CycleCount = mongoose.model("CycleCount", cycleCountSchema);
export default CycleCount;