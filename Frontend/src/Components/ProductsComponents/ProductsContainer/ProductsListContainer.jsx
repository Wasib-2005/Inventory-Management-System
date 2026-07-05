// ProductsListContainer.jsx
import ProductsList from "./ProductsList";

const productsData = [
  // ==========================================
  // 1. BASE PRODUCT (Parent)
  // ==========================================
  {
    _id: "64a2b1f8e4b0c25a1f8b4567", // MongoDB ID (Hidden, used for database queries)
    displayId: "PROD-2026-001", // Admin/Management ID (Visible to team)
    variantOf: null, // Null means this IS the base product

    name: "Quantum Wireless Mouse (Base White)",
    sku: "MS-QT-001-WHT",
    category: "Peripherals",
    unit: "pcs",

    // ==========================================
    // IMAGE — header is the main/cover photo (card + modal header),
    // extra is a gallery of additional shots shown in the details modal.
    // ==========================================
    image: {
      header:
        "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
      extra: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=60",
      ],
    },

    store: [
      { rackCode: "A1", Shelf: "3", qty: 50, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
      { rackCode: "A2", Shelf: "3", qty: 0, maxQty: 100 },
    ],
    price: {
      costPrice: 18.5,
      sellingPrice: 35.0,
    },

    // ==========================================
    // EXTRA DETAILS — arbitrary grouped sections shown in the details modal.
    // Each section: { header, body: [{ label, value }] }
    // ==========================================
    extraDetails: [
      {
        header: "Specifications",
        body: [
          { label: "Color", value: "Arctic White" },
          { label: "Connectivity", value: "2.4GHz Wireless + Bluetooth 5.0" },
          { label: "Battery Life", value: "Up to 6 months" },
          { label: "DPI Range", value: "800 – 4000" },
        ],
      },
      {
        header: "Supplier",
        body: [
          { label: "Supplier Name", value: "NovaTech Peripherals Ltd." },
          { label: "Lead Time", value: "7–10 days" },
          { label: "Last Restocked", value: "2026-06-20" },
        ],
      },
    ],
  },

  // ==========================================
  // 2. VARIANT PRODUCT (Child of the White Mouse)
  // ==========================================
  {
    _id: "64a2b203e4b0c25a1f8b4568",
    displayId: "PROD-2026-001-B",
    variantOf: "64a2b1f8e4b0c25a1f8b4567", // Links directly to the Base White Mouse MongoDB ID

    name: "Quantum Wireless Mouse (Matte Black)",
    sku: "MS-QT-001-BLK",
    category: "Peripherals",
    unit: "pcs",

    image: {
      header:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=60",
      extra: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=60",
      ],
    },

    store: [{ rackCode: "C1", Shelf: "1", qty: 74, maxQty: 150 }],
    price: {
      costPrice: 18.5,
      sellingPrice: 38.0,
    },

    extraDetails: [
      {
        header: "Specifications",
        body: [
          { label: "Color", value: "Matte Black" },
          { label: "Connectivity", value: "2.4GHz Wireless + Bluetooth 5.0" },
          { label: "Battery Life", value: "Up to 6 months" },
          { label: "DPI Range", value: "800 – 4000" },
        ],
      },
      {
        header: "Supplier",
        body: [
          { label: "Supplier Name", value: "NovaTech Peripherals Ltd." },
          { label: "Lead Time", value: "7–10 days" },
          { label: "Last Restocked", value: "2026-07-01" },
        ],
      },
    ],
  },
];

const ProductsListContainer = ({
  canEditProduct,
  onSelectProduct,
  setIsDetailsOpen,
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <div className="grid gap-3 py-5">
      {productsData.map((productData) => (
        <ProductsList
          key={productData._id}
          productData={productData}
          canEditProduct={canEditProduct}
          onClick={() => {
            onSelectProduct(productData);
            setIsDetailsOpen(true);
          }}
          onEdit={() => onEditProduct?.(productData)}
          onDelete={() => onDeleteProduct?.(productData._id)}
        />
      ))}
    </div>
  );
};

export default ProductsListContainer;