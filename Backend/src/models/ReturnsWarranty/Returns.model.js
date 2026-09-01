import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
   
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    resolution:{
      type: String,
      enum:["Refund","Replace","Repair","Store Credit"]
    },
    reason:{
      type: String,
      enum: ["Changed mind", "Wrong item delivered", "Damaged in transit", "Not as described", "Other"]
    },
    notes: {
      type: String,
    },
    qty: {
      type: Number,
      required: true,
    },
    claimed:{
      type:Boolean,
      required: true,
    },
    status:{
      type:String,
      enum: ["pending", "approved", "processing", "rejected", "completed"], 
      default: "pending",
      required: true,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }


  },
  {
    timestamps: true,
  },
);

const Return = mongoose.model("Return",returnSchema)
export default Return;

// {
// [BACKEND]   order: '6a835805aa424133a1d6dab7',
// [BACKEND]   product: '6a833c1c93d1d40f72837591',
// [BACKEND]   warehouse: '6a8335f193d1d40f72837589',
// [BACKEND]   type: 'warranty',
// [BACKEND]   qty: 1,
// [BACKEND]   reason: null,
// [BACKEND]   notes: '',
// [BACKEND]   resolution: 'Replace',
// [BACKEND]   refundAmount: 0,
// [BACKEND]   customer: '6a83343e9fb8097f6a002306'
// [BACKEND] }

