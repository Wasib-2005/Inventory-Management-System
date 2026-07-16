import mongoose from "mongoose";

const shelveSchema = new mongoose.Schema({
  shelfCode: { type: String, required: true },
  productData: [
    {
      productInfo: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      group: {
        groupName: { type: String },
        groupColour: { type: String },
      },
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
    },
  ],
});

export const Shelve = mongoose.model("Shelve", shelveSchema);
