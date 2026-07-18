import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbSearch,
  TbX,
  TbPackage,
  TbArrowLeft,
  TbPlus,
  TbAlertTriangle,
} from "react-icons/tb";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { commonFieldColour } from "../../../Theme/commonFieldColour";
import { commonInputField } from "../../../Theme/commonInputField";
import { primaryButton } from "../../../Theme/primaryButton";
import useDebounce from "../../../Hooks/useDebounce";

// shelf: the shelf a product is being added to
// onSearchProducts(query) -> Promise<Product[]>   (parent owns the axios call)
// onSubmit({ productId, inStock, maxStock, warningStock }) -> Promise<{ error? }>
const WarehouseShelfProductPicker = ({
  isOpen,
  shelf,
  onClose,
  onSearchProducts,
  onSubmit,
}) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inStock, setInStock] = useState("0");
  const [maxStock, setMaxStock] = useState("");
  const [warningStock, setWarningStock] = useState("0");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setResults([]);
    setSelectedProduct(null);
    setInStock("0");
    setMaxStock("");
    setWarningStock("0");
    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || selectedProduct) return;
    const term = debouncedQuery.trim();
    if (!term) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    onSearchProducts(term)
      .then((data) => {
        if (!cancelled) setResults(data || []);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isOpen, selectedProduct, onSearchProducts]);

  if (!shelf) return null;

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setError(null);
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const max = Number(maxStock);
    const stock = Number(inStock);
    const warning = Number(warningStock);

    if (!maxStock || max <= 0) {
      setError("Max stock must be greater than 0.");
      return;
    }
    if (stock < 0 || stock > max) {
      setError("In-stock must be between 0 and max stock.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit({
        productId: selectedProduct._id,
        inStock: stock,
        maxStock: max,
        warningStock: warning,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to add product.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-emerald-950/30 backdrop-blur-sm p-4"
          onClick={() => !isSubmitting && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`${commonComponentBG()} w-full max-w-md p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60 flex items-center gap-1.5">
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="text-emerald-700/50 hover:text-emerald-900 transition-colors disabled:opacity-30"
                  >
                    <TbArrowLeft size={15} />
                  </button>
                )}
                Add Product to {shelf.shelfCode}
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-emerald-700/50 hover:text-emerald-900 transition-colors disabled:opacity-30"
              >
                <TbX size={16} />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                <TbAlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!selectedProduct ? (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <TbSearch
                    size={14}
                    className={commonFieldColour.icon}
                    style={{ top: "12px" }}
                  />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, SKU, or ID..."
                    className={`${commonInputField} pl-8`}
                  />
                </div>

                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                      Searching...
                    </p>
                  ) : !query.trim() ? (
                    <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                      Start typing to find a product.
                    </p>
                  ) : results.length === 0 ? (
                    <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                      No matching products.
                    </p>
                  ) : (
                    results.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => handleSelectProduct(p)}
                        className="flex items-center justify-between gap-2 px-3 py-2 text-left rounded-lg border border-emerald-300/30 bg-white/50 hover:bg-emerald-50/70 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <TbPackage
                            size={13}
                            className="text-emerald-600 shrink-0"
                          />
                          <span className="text-xs font-semibold text-emerald-900 truncate">
                            {p.name}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700/60 shrink-0">
                          {p.sku || p.displayId || ""}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <TbPackage size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900 truncate">
                    {selectedProduct.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-700/60 uppercase">
                      In Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={isSubmitting}
                      value={inStock}
                      onChange={(e) => setInStock(e.target.value)}
                      className={`${commonInputField} disabled:opacity-60`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-700/60 uppercase">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      disabled={isSubmitting}
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      className={`${commonInputField} disabled:opacity-60`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-700/60 uppercase">
                      Warn At
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={isSubmitting}
                      value={warningStock}
                      onChange={(e) => setWarningStock(e.target.value)}
                      className={`${commonInputField} disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-emerald-200">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleBack}
                    className={`${primaryButton} disabled:opacity-50`}
                    style={{ backgroundColor: "Black", color: "#fff" }}
                  >
                    <TbArrowLeft size={15} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${primaryButton} disabled:opacity-50`}
                    style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
                  >
                    <TbPlus size={15} />
                    {isSubmitting ? "Adding..." : "Add to Shelf"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseShelfProductPicker;
