// ProductsListContainer.jsx
import ProductsList from "./ProductsList";

const productsData = [
  {
    id: "PROD-001",
    name: "Quantum Wireless Mouse",
    sku: "MS-QT-001",
    category: "Peripherals",
    unit: "pcs",
    currentStock: 124,
    lowStockThreshold: 20,
    unitCost: 18.5,
    location: "WH-A / Rack 3",
    variants: 2,
    lastMovement: { type: "IN", qty: 50, date: "2026-06-20" },
    updatedBy: "Rashed (Worker)",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=60",
  },
  {
    id: "PROD-003",
    name: 'UltraWide 34" Curved Monitor',
    sku: "MN-UW-003",
    category: "Displays",
    unit: "pcs",
    currentStock: 8,
    lowStockThreshold: 10,
    unitCost: 310.0,
    location: "WH-B / Rack 1",
    variants: 1,
    lastMovement: { type: "OUT", qty: 4, date: "2026-06-23" },
    updatedBy: "Admin",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&auto=format&fit=crop&q=60",
  },
  {
    id: "PROD-004",
    name: "Pro Streamer USB Microphone",
    sku: "MC-USB-004",
    category: "Audio",
    unit: "pcs",
    currentStock: 0,
    lowStockThreshold: 5,
    unitCost: 62.0,
    location: "WH-A / Rack 5",
    variants: 1,
    lastMovement: { type: "OUT", qty: 12, date: "2026-06-18" },
    updatedBy: "Mizan (Worker)",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&auto=format&fit=crop&q=60",
  },
  {
    id: "PROD-008",
    name: "1TB NVMe M.2 Solid State Drive",
    sku: "HD-SSD-008",
    category: "Components",
    unit: "pcs",
    currentStock: 3,
    lowStockThreshold: 15,
    unitCost: 71.0,
    location: "WH-A / Rack 2",
    variants: 3,
    lastMovement: { type: "OUT", qty: 9, date: "2026-06-24" },
    updatedBy: "Admin",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&auto=format&fit=crop&q=60",
  },
];

const ProductsListContainer = ({ canEditProduct, onSelectProduct }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {productsData.map((productData) => (
        <ProductsList
          key={productData.id}
          productData={productData}
          canEditProduct={canEditProduct}
          onClick={() => onSelectProduct(productData)}
        />
      ))}
    </div>
  );
};

export default ProductsListContainer;