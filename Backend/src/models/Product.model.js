import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    displayId: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "DRAFT", "ARCHIVED", "DISCONTINUED"],
      default: "ACTIVE",
    },
    parentProductId: {
      // for variant must have
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    barcodes: [
      {
        code: { type: String, trim: true },
        type: { type: String, trim: true },
      },
    ],
    categoryData: {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        trim: true,
      },
      subcategory: {
        type: String,
        trim: true,
      },
    },

    supplierData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        trim: true,
      },
    ],
    tags: [{ type: String, trim: true }],

    flags: {
      isSellable: { type: Boolean, default: true },
      isPurchasable: { type: Boolean, default: true },
      isBatchTracked: { type: Boolean, default: false },
    },

    uom: {
      baseUnit: { type: String, default: "pcs", trim: true },
      salesUnit: { type: String, default: "pcs", trim: true },
      purchaseUnit: { type: String, default: "pcs", trim: true },
      conversionFactor: { type: Number, default: 1 },
    },

    pricing: {
      buyPrice: { type: Number, default: 0 },
      sellPrice: { type: Number, default: 0 },
      mrp: { type: Number, default: 0 },
      taxRatePercentage: { type: Number, default: 0 },
    },

    compliance: {
      hsnCode: { type: String, trim: true, default: "" },
      countryOfOrigin: { type: String, trim: true, default: "" },
    },

    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    image: {
      header: { type: String, default: "" },
      extra: [{ type: String }],
    },

    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deleteBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    extraDetails: [
      {
        header: { type: String, required: true, trim: true },
        body: [
          {
            label: { type: String, required: true, trim: true },
            value: { type: String, required: true, trim: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: "text", brand: "text", tags: "text" });

productSchema.index({ barcodes: 1 });
productSchema.index({ "categoryData.category": 1 });
productSchema.index({ "categoryData.subcategory": 1 });
productSchema.index({ supplierData: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
