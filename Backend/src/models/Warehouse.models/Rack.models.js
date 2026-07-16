import mongoose from "mongoose";

const rackSchema = new mongoose.Schema(
  {
    rackCode: { type: String, required: true },
    column: { type: String, required: true },
    group: {
      groupName: { type: String },
      groupColor: { type: String },
    },
    shelfData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shelve",
      },
    ],
    createdBy: {
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

export const Rack = mongoose.model("Rack", rackSchema);
