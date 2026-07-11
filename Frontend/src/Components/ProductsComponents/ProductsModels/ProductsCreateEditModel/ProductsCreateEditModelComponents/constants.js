export const emptyProduct = {
  displayId: "",
  sku: "",
  name: "",
  brand: "",
  status: "ACTIVE",

  parentProductId: null,
  variantAttributes: {},

  barcodes: [],
  categoryIds: [],
  supplierIds: [],
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
};

export const BARCODE_TYPES = ["unit", "case", "pallet"];
export const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "DISCONTINUED"];
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
