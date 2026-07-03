import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  X,
  Plus,
  PackageOpen,
  Layers,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { commonInputField } from "../../../Theme/commonInputField";
import { primaryButton } from "../../../Theme/primaryButton";
import { occupancyColor, isShelfFull, DEFAULT_MAX_PRODUCTS } from "../MockData";

const WarehouseRackModal = ({
  rack,
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onUpdateShelfMaxProducts,
  shelfMaxProductsError,
  onAddShelf,
}) => {
  const [productInputs, setProductInputs] = useState({}); // { [shelfId]: { name, qty, maxQty } }
  const [newShelfMaxProducts, setNewShelfMaxProducts] =
    useState(DEFAULT_MAX_PRODUCTS);

  if (!rack) return null;

  const updateInput = (shelfId, field, value) => {
    console.log("Updating input for shelf:", shelfId, field, value);
    setProductInputs((prev) => ({
      ...prev,
      [shelfId]: { ...prev[shelfId], [field]: value },
    }));
  };

  const handleAddProduct = (shelf) => {
    if (isShelfFull(shelf)) return;

    const input = productInputs[shelf.id];
    if (!input?.name || !input?.qty || !input?.maxQty) return;

    onAddProduct(shelf.id, {
      id: `${shelf.id}-P${Date.now()}`,
      name: input.name,
      qty: Number(input.qty),
      maxQty: Number(input.maxQty),
    });

    setProductInputs((prev) => ({
      ...prev,
      [shelf.id]: { name: "", qty: "", maxQty: "" },
    }));
  };

  const handleAddShelf = () => {
    onAddShelf(Number(newShelfMaxProducts) || DEFAULT_MAX_PRODUCTS);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`${commonComponentBG()} w-full max-w-2xl max-h-[85vh] p-5 flex flex-col gap-4 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Package size={16} color={PALETTE.steel} />
                Rack {rack.code}
                <span className="text-[11px] font-semibold text-emerald-700/50">
                  ({rack.itemCount}/{rack.capacity})
                </span>
              </h3>
              <button
                onClick={onClose}
                className="text-emerald-700/50 hover:text-emerald-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {shelfMaxProductsError && (
              <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5 shrink-0">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{shelfMaxProductsError}</span>
              </div>
            )}

            {/* Shelves list */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {rack.shelves.length === 0 ? (
                <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                  This rack has no shelves yet.
                </p>
              ) : (
                rack.shelves.map((shelf) => {
                  const shelfColor = occupancyColor(
                    shelf.itemCount,
                    shelf.capacity,
                  );
                  const input = productInputs[shelf.id] || {
                    name: "",
                    qty: "",
                    maxQty: "",
                  };
                  const full = isShelfFull(shelf);

                  return (
                    <div
                      key={shelf.id}
                      className="rounded-xl border border-emerald-300/40 bg-white/50 p-3 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <Layers size={12} className="text-emerald-600" />
                          {shelf.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              full
                                ? "bg-red-100 border border-red-300"
                                : "bg-emerald-50 border border-emerald-200"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-black ${
                                full ? "text-red-700" : "text-emerald-800"
                              }`}
                            >
                              {shelf.products.length}/
                            </span>
                            <input
                              type="number"
                              min={shelf.products.length || 1}
                              value={shelf.maxProducts}
                              onChange={(e) =>
                                onUpdateShelfMaxProducts(
                                  shelf.id,
                                  e.target.value,
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={`w-8 bg-white/70 rounded text-[10px] font-black text-center border border-black/10 py-0.5 ${
                                full ? "text-red-700" : "text-emerald-800"
                              }`}
                            />
                            <span
                              className={`text-[9px] font-bold ${
                                full ? "text-red-700" : "text-emerald-800"
                              }`}
                            >
                              slots
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                            style={shelfColor.style}
                          >
                            {shelf.itemCount}/{shelf.capacity}
                          </span>
                        </div>
                      </div>

                      {/* Existing products - qty/maxQty editable inline */}
                      {shelf.products.length === 0 ? (
                        <p className="text-[11px] text-emerald-700/40 font-semibold py-1 text-center flex items-center justify-center gap-1">
                          <PackageOpen size={12} />
                          Empty shelf
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {shelf.products.map((p) => {
                            const pColor = occupancyColor(p.qty, p.maxQty);
                            const pPct =
                              p.maxQty > 0 ? (p.qty / p.maxQty) * 100 : 0;
                            return (
                              <div
                                key={p.id}
                                className="flex flex-col gap-1 px-2 py-1.5 rounded-lg bg-white/60 border border-emerald-300/30"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-semibold text-emerald-900 truncate flex-1">
                                    {p.name}
                                  </span>
                                  <div
                                    className="flex items-center gap-1 shrink-0 rounded px-1 py-0.5"
                                    style={{
                                      backgroundColor:
                                        pColor.style.backgroundColor,
                                    }}
                                  >
                                    <input
                                      type="number"
                                      min="0"
                                      value={p.qty}
                                      onChange={(e) =>
                                        onUpdateProduct(
                                          shelf.id,
                                          p.id,
                                          "qty",
                                          e.target.value,
                                        )
                                      }
                                      className="w-10 bg-white/70 rounded text-[10px] font-bold text-center border border-black/10 py-0.5"
                                    />
                                    <span className="text-[10px] font-bold">
                                      /
                                    </span>
                                    <input
                                      type="number"
                                      min="1"
                                      value={p.maxQty}
                                      onChange={(e) =>
                                        onUpdateProduct(
                                          shelf.id,
                                          p.id,
                                          "maxQty",
                                          e.target.value,
                                        )
                                      }
                                      className="w-10 bg-white/70 rounded text-[10px] font-bold text-center border border-black/10 py-0.5"
                                    />
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                                    style={{ width: `${Math.min(pPct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add product to this shelf */}
                      {full ? (
                        <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-emerald-100 text-[11px] font-bold text-red-600 py-1.5">
                          <Lock size={12} />
                          Shelf full — no more product slots
                        </div>
                      ) : (
                        <div className=" flex justify-between gap-1.5 pt-3 border-t border-emerald-100">
                          <div className="grid grid-cols-3 w-full gap-2">
                            <input
                              type="text"
                              value={input.name}
                              onChange={(e) =>
                                updateInput(shelf.id, "name", e.target.value)
                              }
                              placeholder="Product name"
                              className={`${commonInputField} text-xs py-1.5 flex-1`}
                            />
                            <input
                              type="number"
                              min="0"
                              value={input.qty}
                              onChange={(e) =>
                                updateInput(shelf.id, "qty", e.target.value)
                              }
                              placeholder="Qty"
                              className={`${commonInputField} text-xs py-1.5 w-14`}
                            />
                            <input
                              type="number"
                              min="1"
                              value={input.maxQty}
                              onChange={(e) =>
                                updateInput(shelf.id, "maxQty", e.target.value)
                              }
                              placeholder="Max"
                              className={`${commonInputField} text-xs py-1.5 w-14`}
                            />
                          </div>

                          <button
                            onClick={() => handleAddProduct(shelf)}
                            className="shrink-0 p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add shelf */}
            <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-emerald-100">
              <div className="flex items-center gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/60 whitespace-nowrap">
                  Max slots
                </label>
                <input
                  type="number"
                  min="1"
                  value={newShelfMaxProducts}
                  onChange={(e) => setNewShelfMaxProducts(e.target.value)}
                  className={`${commonInputField} py-1.5 text-xs w-16`}
                />
              </div>
              <button
                onClick={handleAddShelf}
                className={`${primaryButton} flex-1`}
                style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
              >
                <Plus size={15} />
                Add Shelf
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseRackModal;
