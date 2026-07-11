import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    warehouseName: {
      type: String,
      required: true,
    },
    warehouseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    place: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    rackRows: {
      type: [String],
      required: true,
    },
    racksPerRow: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Warehouse = mongoose.model("Warehouse", warehouseSchema);
