import { useMemo } from "react";
import { FiSearch, FiPackage } from "react-icons/fi";
import ProductsList from "./ProductsList";

// TODO: replace with data fetched from `/api/products/:warehouseId` once
export const initialProductsData = [
  {
    _id: "64a2b1f8e4b0c25a1f8b4567",
    displayId: "PROD-2026-001",
    barCode: "23534865245576",
    variantOf: null,

    name: "Quantum Wireless Mouse (Base White)",
    sku: "MS-QT-001-WHT",
    category: "Peripherals",
    unit: "pcs",

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
  {
    // NOTE: previously had no _id at all, which broke the list `key` and
    // silently passed `undefined` to onDeleteProduct. Every product needs
    // a stable id - the backend will supply a real one; this placeholder
    // keeps local/demo data safe in the meantime.
    _id: "local-draft-1",
    displayId: "",
    barCode: "",
    variantOf: "",
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    image: {
      header:
        "blob:https://localhost:3000/6896aa60-a953-40e6-bef3-f937216e5667",
      extra: [
        "blob:https://localhost:3000/d8108ac3-9148-4852-a70a-d925989394be",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrY4zNW5agCCSjjTHe1acNzo5yh2DXM6G8RXMYDZ6KLv_Gq4cuqkMWaJKd&s=10",
      ],
    },
    store: [],
    price: {
      costPrice: 0,
      sellingPrice: 0,
    },
    extraDetails: [],
  },

  {
    _id: "64a2b203e4b0c25a1f8b4568",
    displayId: "PROD-2026-001-B",
    variantOf: "64a2b1f8e4b0c25a1f8b4567",
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

const getTotals = (store = []) => {
  const totalStock = store.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalCapacity = store.reduce(
    (sum, item) => sum + (item.maxQty || 0),
    0,
  );
  return { totalStock, totalCapacity };
};

const getStockStatus = ({ totalStock, totalCapacity }) => {
  if (totalStock === 0) return "Out of Stock";
  if (totalCapacity > 0 && totalStock / totalCapacity <= 0.3)
    return "Low Stock";
  return "In Stock";
};

const sortProducts = (list, sortBy) => {
  const sorted = [...list];
  switch (sortBy) {
    case "Name (A-Z)":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "Stock (Low to High)":
      return sorted.sort(
        (a, b) => getTotals(a.store).totalStock - getTotals(b.store).totalStock,
      );
    case "Stock (High to Low)":
      return sorted.sort(
        (a, b) => getTotals(b.store).totalStock - getTotals(a.store).totalStock,
      );
    case "Recently Added":
    default:
      return sorted;
  }
};

const ProductsListContainer = ({
  productsData,
  query,
  canEditProduct,
  onSelectProduct,
  setIsDetailsOpen,
  onEditProduct,
  onDeleteProduct,
}) => {
  const { warehouseId, search, sortBy, filters } = query;

  const filteredProducts = useMemo(() => {
    if (!warehouseId) return [];

    let list = productsData;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.sku, p.barCode, p.displayId]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }

    if (filters.category) {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.variant === "base") {
      list = list.filter((p) => !p.variantOf);
    } else if (filters.variant === "variant") {
      list = list.filter((p) => !!p.variantOf);
    }

    if (filters.stockStatus) {
      list = list.filter(
        (p) => getStockStatus(getTotals(p.store)) === filters.stockStatus,
      );
    }

    return sortProducts(list, sortBy);
  }, [productsData, warehouseId, search, sortBy, filters]);

  if (!warehouseId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <FiPackage size={28} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          Select a warehouse above to view its products
        </p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <FiSearch size={28} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          No products match your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 py-5">
      {filteredProducts.map((productData) => (
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
