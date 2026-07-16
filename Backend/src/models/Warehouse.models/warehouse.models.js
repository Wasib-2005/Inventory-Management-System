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
    rackdata: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rack",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deleteBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Warehouse = mongoose.model("Warehouse", warehouseSchema);
