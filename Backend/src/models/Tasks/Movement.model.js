import mongoose from "mongoose";

const movementSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    items: [
      {
        productData: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        qty: { type: Number, required: true },
        receivedQty: { type: Number, min: 0 },
        discrepancyNote: { type: String, trim: true },
        sourceLocation: {
          rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
          rackCode: { type: String, trim: true },
          shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
          shelfCode: { type: String, trim: true },
        },
        destinationLocation: {
          rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
          rackCode: { type: String, trim: true },
          shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
          shelfCode: { type: String, trim: true },
        },
        destinationLocations: [
          {
            rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
            rackCode: { type: String, trim: true },
            shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
            shelfCode: { type: String, trim: true },
            qty: { type: Number, min: 0, required: true },
          },
        ],
      },
    ],
    destinationType: {
      type: String,
      enum: ["shipment", "warehouse"],
    },
    fromWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    trackCode: { type: String, trim: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    supplyDate: { type: Date },
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sourceLocation: {
      rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
      rackCode: { type: String, trim: true },
      shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
      shelfCode: { type: String, trim: true },
    },
    destinationLocation: {
      rackId: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
      rackCode: { type: String, trim: true },
      shelfId: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
      shelfCode: { type: String, trim: true },
    },
    discrepancy: {
      status: { type: String, enum: ["none", "recorded", "resolved"], default: "none" },
      note: { type: String, trim: true },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      recordedAt: { type: Date },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },
    verification: {
      mode: {
        type: String,
        enum: ["verify_only", "verify_and_put"],
      },
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
  },
  { timestamps: true },
);

movementSchema.index({ createdAt: -1, type: 1 });
const Movement = mongoose.model("Movement", movementSchema);
export default Movement;
