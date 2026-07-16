import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
  shelfCode: { type: String, required: true },
  productData: [
    {
      productInfo: { type: mongoose.Schema.Types.ObjectId },
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
