// The backend's Product schema stores categoryData.category and each entry
// in supplierData as raw ObjectId refs (see Category/Supplier models). The
// GET /api/product/get/:id route needs to .populate() both for the edit form
// to show real names instead of blank chips — these helpers accept either
// shape (populated object or bare id) so the form doesn't crash either way,
// but populated data is what actually renders correctly.

export const normalizeCategoryData = (categoryData) => {
  if (!categoryData) return null;
  const category = categoryData.category;

  // Populated: { _id, category: "Name", subCategories: [...] }
  if (category && typeof category === "object") {
    return {
      _id: category._id,
      category: category.category || category.name || "",
      subcategory: categoryData.subcategory || "",
    };
  }

  // Not populated — only the raw id survived, no display name available.
  if (category) {
    return { _id: category, category: "", subcategory: categoryData.subcategory || "" };
  }

  return null;
};

export const normalizeSupplierData = (supplierData) => {
  if (!Array.isArray(supplierData)) return [];
  return supplierData.map((supplier) =>
    typeof supplier === "object" && supplier !== null
      ? supplier
      : { _id: supplier, suppliersName: "", code: "" },
  );
};

// Pricing numbers can come back as `null` (see taxRatePercentage in the
// sample doc) — inputs need "" instead of null or React warns and treats
// the field as uncontrolled.
export const normalizePricing = (pricing, fallback) => {
  const merged = { ...fallback, ...pricing };
  Object.keys(merged).forEach((key) => {
    if (merged[key] === null || merged[key] === undefined) merged[key] = "";
  });
  return merged;
};

// Uploaded images are stored as relative object-storage keys
// (e.g. "products/headerImage--...jpeg"), not full URLs. Local blob:
// previews and any already-absolute URL are left alone.
const ASSET_BASE = (import.meta.env.VITE_AWS_HEADER ||
  import.meta.env.VITE_ASSET_BASE_URL ||
  import.meta.env.VITE_BACKEND_API_HEADER ||
  ""
).replace(/\/$/, "");

export const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  return `${ASSET_BASE}/${path.replace(/^\//, "")}`;
};
