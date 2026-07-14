export const emptyProduct = {
  displayId: "",
  sku: "",
  name: "",
  brand: "",
  status: "ACTIVE",

  parentProductId: null,
  variantAttributes: {},

  barcodes: [],
  // Single category (not an array): { _id, category, subcategory } | null
  categoryData: null,
  // Array of full supplier objects: { _id, suppliersName, code, place }
  supplierData: [],
  tags: [],

  flags: {
    isSellable: true,
    isPurchasable: true,
    isBatchTracked: false,
  },

  uom: {
    baseUnit: "pcs",
    salesUnit: "pcs",
    purchaseUnit: "pcs",
    conversionFactor: 1,
  },

  pricing: {
    buyPrice: "",
    sellPrice: "",
    mrp: "",
    taxRatePercentage: "",
  },

  compliance: {
    hsnCode: "",
    countryOfOrigin: "",
  },

  specifications: [],

  image: { header: "", extra: [] },
  extraDetails: [],

  // Added SEO / SCO defaults to match the new UI section
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
};

export const BARCODE_TYPES = ["unit", "case", "pallet"];
// Must match the Product schema's status enum exactly, or the backend
// rejects the save. ("INACTIVE" isn't a valid value; DRAFT/ARCHIVED were
// missing.)
export const STATUS_OPTIONS = ["ACTIVE", "DRAFT", "ARCHIVED", "DISCONTINUED"];
export const UNIT_OPTIONS = [
  "pcs",
  "box",
  "packet",
  "kg",
  "g",
  "mg",
  "l",
  "ml",
  "strip",
];
