import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    suppliersName: {
      type: String,
      required: [true, "Supplier Name is required"],
      trim: true,
    },
    supplierCode: {
      type: String,
      required: [true, "Supplier code is required"],
      unique: true, 
      uppercase: true,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, required: true },
    },
    contact: {
      person: { type: String, trim: true },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
      },
      phone: { type: String, trim: true },
    },
    financials: {
      taxId: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blacklisted"],
      default: "Active",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

supplierSchema.index({ suppliersName: "text", supplierCode: 1 });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;