import { useContext, useEffect, useRef, useState } from "react";
import { FiSearch, FiPackage, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineBarcode } from "react-icons/ai";
import { WareHouseContext } from "../../../../Contexts/WareHouseContext/WareHouseContext";
import ProductLocationPicker from "./ProductLocationPicker";
import { searchProductsByBarcode, searchProductsByName } from "../api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;
const WARN_DURATION = 3000;

// onSelectProduct is always called as (product, shelf):
// - shelf is the chosen entry from product.shelveData ({ rackId, rackCode, shelfCode,
//   shelfId, stock: { inStock, ... } }) when a location was picked or only
//   one shelf exists
// - shelf is null/undefined when the product has no shelveData at all
const ProductSearchPanel = ({ onSelectProduct }) => {
  const { selectedWarehouseId } = useContext(WareHouseContext);

  const [mode, setMode] = useState("name"); // "name" | "barcode"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockWarning, setStockWarning] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const containerRef = useRef(null);
  const warnTimeoutRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setIsLoading(true);
      setError("");
      const request =
        mode === "name"
          ? searchProductsByName(query, selectedWarehouseId, controller.signal, 8)
          : searchProductsByBarcode(query, selectedWarehouseId, controller.signal, 8);

      request
        .then((res) => {
          setResults(res.data?.data || []);
          setIsOpen(true);
        })
        .catch((err) => {
          if (err.name !== "CanceledError") {
            setError(err.response?.data?.message || "Could not search products");
          }
        })
        .finally(() => setIsLoading(false));
    }, 350);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query, mode, selectedWarehouseId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(warnTimeoutRef.current), []);

  const warnNoStock = (name) => {
    clearTimeout(warnTimeoutRef.current);
    setStockWarning(`"${name}" has no stock available`);
    warnTimeoutRef.current = setTimeout(() => setStockWarning(""), WARN_DURATION);
  };

  const handleSelect = (product) => {
    const shelves = product.shelveData || [];

    // More than one shelf holds this product — make the user pick which
    // one, rather than silently defaulting to the first.
    if (shelves.length > 1) {
      setPendingProduct(product);
      setQuery("");
      setResults([]);
      setIsOpen(false);
      return;
    }

    const shelf = shelves[0] || null;
    const stock = shelf ? Number(shelf.stock?.inStock) || 0 : Number(product.stock) || 0;
    if (stock <= 0) warnNoStock(product.name);

    onSelectProduct(product, shelf);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleConfirmLocation = (shelf) => {
    const stock = Number(shelf.stock?.inStock) || 0;
    if (stock <= 0) warnNoStock(pendingProduct.name);
    onSelectProduct(pendingProduct, shelf);
    setPendingProduct(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
          Add Products
        </h4>
        <div className="flex p-0.5 rounded-md bg-emerald-900/5 border border-emerald-300/30 gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => setMode("name")}
            className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${
              mode === "name"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/50 hover:text-emerald-700"
            }`}
          >
            <FiSearch size={10} /> Name
          </button>
          <button
            type="button"
            onClick={() => setMode("barcode")}
            className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${
              mode === "barcode"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/50 hover:text-emerald-700"
            }`}
          >
            <AiOutlineBarcode size={11} /> Barcode
          </button>
        </div>
      </div>

      {!selectedWarehouseId && (
        <p className="text-[11px] text-amber-600 mb-1.5">
          No warehouse selected — stock levels may not be accurate
        </p>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={
          mode === "name" ? "Search product by name..." : "Scan or type barcode..."
        }
        className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      />

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}

      {stockWarning && (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 mt-1.5 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
          <FiAlertTriangle size={12} className="shrink-0" />
          {stockWarning} — added anyway, double check before confirming
        </p>
      )}

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-emerald-300/40 rounded-lg shadow-lg">
          {isLoading ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">
              No products found
            </p>
          ) : (
            results.map((product) => {
              const shelves = product.shelveData || [];
              const stock = Number(product.stock) || 0;
              const outOfStock = stock <= 0;
              return (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-emerald-50/60 border-b border-emerald-100 last:border-b-0 transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image?.header ? (
                      <img
                        src={product.image.header}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiPackage size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-emerald-900 truncate">
                      {product.name}
                      {product.brand && (
                        <span className="text-emerald-700/50 font-medium">
                          {" "}
                          · {product.brand}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-emerald-700/50">
                      {product.displayId} · SKU: {product.sku}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[12px] font-bold text-emerald-900">
                      {currency}
                      {product.pricing?.sellPrice?.toLocaleString?.() ?? "—"}
                    </span>
                    <span
                      className={`block text-[9px] font-bold uppercase mt-0.5 ${
                        outOfStock ? "text-rose-600" : "text-emerald-700/50"
                      }`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : shelves.length > 1
                          ? `${shelves.length} shelves · Stock: ${stock}`
                          : `Stock: ${stock}`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {pendingProduct && (
        <ProductLocationPicker
          product={pendingProduct}
          onConfirm={handleConfirmLocation}
          onCancel={() => setPendingProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductSearchPanel;