import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      },
    ],
    payment: {
      status: {
        type: String,
        required: true,
        lowercase: true,
        enum: {
          values: ["credit", "paid"],
          message:
            '{VALUE} is not a valid status. Only "credit" or "paid" are allowed.',
        },
      },
      paidAmount: { type: Number, required: true, default: 0 },
      discountAmount: { type: Number, required: true, default: 0 },
    },

    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
