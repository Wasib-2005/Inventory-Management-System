import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    guestCustomer: {
      username: { type: String, trim: true },
      mobile: { type: String, trim: true },
      address: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        location: {
          rack: { type: mongoose.Schema.Types.ObjectId, ref: "Rack" },
          shelve: { type: mongoose.Schema.Types.ObjectId, ref: "Shelve" },
        },
      },
    ],
    payment: {
      status: {
        type: String,
        required: true,
        lowercase: true,
        enum: {
          values: ["due", "paid"],
          message:
            '{VALUE} is not a valid status. Only "due" or "paid" are allowed.',
        },
      },
      paidAmount: { type: Number, required: true, default: 0 },
      discountAmount: { type: Number, required: true, default: 0 },
    },

    warehouseData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "complete","confirm", "delivered"],
        message:
          '{VALUE} is not a valid status. Only "pending", "complete", "delivered" or "confirm" are allowed.',
      },
      default: "pending",
    },

    dueAmount: {
      type: Number,
    },
    returnAmount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
