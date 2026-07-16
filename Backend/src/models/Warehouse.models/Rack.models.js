import mongoose from "mongoose";

const rackSchema = new mongoose.Schema({
  rackCode: { type: String, required: true },
  group: {
    groupName: { type: String },
    groupColour: { type: String },
  },
  shelfData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelf",
  },
});

export const Rack = mongoose.model("Rack", rackSchema);
