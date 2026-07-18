import mongoose from "mongoose";

const shelveSchema = new mongoose.Schema({
  shelfCode: { type: String, required: true },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isDeleted: { type: Boolean, default: false },
  deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  productData: [
    {
      productInfo: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      stock: {
        inStock: { type: Number },
        maxStock: { type: Number },
        warningStock: {
          type: Number,
          default: function () {
            if (this.maxStock !== undefined) {
              return (this.maxStock * 20) / 100;
            }
            return 0;
          },
        },
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
  ],
});

export const Shelve = mongoose.model("Shelve", shelveSchema);
