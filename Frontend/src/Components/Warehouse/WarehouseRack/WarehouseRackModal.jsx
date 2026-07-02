import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X, Plus, PackageOpen, Layers } from "lucide-react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { commonInputField } from "../../../Theme/commonInputField";
import { primaryButton } from "../../../Theme/primaryButton";
import { occupancyColor } from "../MockData";

const WarehouseRackModal = ({ rack, isOpen, onClose, onAddProduct, onAddShelf }) => {
  const [productInputs, setProductInputs] = useState({}); // { [shelfId]: { name, qty, maxQty } }

  if (!rack) return null;

  const updateInput = (shelfId, field, value) => {
    setProductInputs((prev) => ({
      ...prev,
      [shelfId]: { ...prev[shelfId], [field]: value },
    }));
  };

  const handleAddProduct = (shelf) => {
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

            {/* Shelves list */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {rack.shelves.length === 0 ? (
                <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                  This rack has no shelves yet.
                </p>
              ) : (
                rack.shelves.map((shelf) => {
                  const shelfColor = occupancyColor(shelf.itemCount, shelf.capacity);
                  const input = productInputs[shelf.id] || { name: "", qty: "", maxQty: "" };

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
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                          style={shelfColor.style}
                        >
                          {shelf.itemCount}/{shelf.capacity}
                        </span>
                      </div>

                      {/* Existing products, each with its own qty/maxQty */}
                      {shelf.products.length === 0 ? (
                        <p className="text-[11px] text-emerald-700/40 font-semibold py-1 text-center flex items-center justify-center gap-1">
                          <PackageOpen size={12} />
                          Empty shelf
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {shelf.products.map((p) => {
                            const pColor = occupancyColor(p.qty, p.maxQty);
                            const pPct = p.maxQty > 0 ? (p.qty / p.maxQty) * 100 : 0;
                            return (
                              <div
                                key={p.id}
                                className="flex flex-col gap-1 px-2 py-1.5 rounded-lg bg-white/60 border border-emerald-300/30"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-emerald-900">
                                    {p.name}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold px-1 rounded"
                                    style={{ backgroundColor: pColor.style.backgroundColor }}
                                  >
                                    {p.qty}/{p.maxQty}
                                  </span>
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
                      <div className="flex items-center gap-1.5 pt-1 border-t border-emerald-100">
                        <input
                          type="text"
                          value={input.name}
                          onChange={(e) => updateInput(shelf.id, "name", e.target.value)}
                          placeholder="Product name"
                          className={`${commonInputField} text-xs py-1.5 flex-1`}
                        />
                        <input
                          type="number"
                          min="0"
                          value={input.qty}
                          onChange={(e) => updateInput(shelf.id, "qty", e.target.value)}
                          placeholder="Qty"
                          className={`${commonInputField} text-xs py-1.5 w-14`}
                        />
                        <input
                          type="number"
                          min="1"
                          value={input.maxQty}
                          onChange={(e) => updateInput(shelf.id, "maxQty", e.target.value)}
                          placeholder="Max"
                          className={`${commonInputField} text-xs py-1.5 w-14`}
                        />
                        <button
                          onClick={() => handleAddProduct(shelf)}
                          className="shrink-0 p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add shelf */}
            <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-emerald-100">
              <button
                onClick={onAddShelf}
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