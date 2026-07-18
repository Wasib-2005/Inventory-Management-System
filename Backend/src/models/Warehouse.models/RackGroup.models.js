import mongoose from "mongoose";
// TODO
const rackGroupSchema = new mongoose.Schema(
  {
    group: {
      groupName: { type: String },
      groupColor: { type: String },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

export const Rack = mongoose.model("RackGroup", rackGroupSchema);
