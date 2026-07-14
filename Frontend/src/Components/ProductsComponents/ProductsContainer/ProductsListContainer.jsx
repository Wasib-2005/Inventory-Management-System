import { useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import ProductsList from "./ProductsList";

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
  const { search, sortBy, filters } = query;

  const filteredProducts = useMemo(() => {
    let list = productsData;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.sku, p.barcodes?.[0]?.code, p.displayId]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }

    if (filters.category) {
      list = list.filter(
        (p) =>
          p.categoryData?.category === filters.category ||
          p.category === filters.category,
      );
    }

    if (filters.variant === "base") {
      list = list.filter((p) => !p.parentProductId);
    } else if (filters.variant === "variant") {
      list = list.filter((p) => !!p.parentProductId);
    }

    if (filters.stockStatus) {
      list = list.filter(
        (p) => getStockStatus(getTotals(p.store)) === filters.stockStatus,
      );
    }

    return sortProducts(list, sortBy);
  }, [productsData, search, sortBy, filters]);

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
