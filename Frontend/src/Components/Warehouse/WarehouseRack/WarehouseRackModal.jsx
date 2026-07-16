import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X, Plus, PackageOpen, Layers, AlertTriangle } from "lucide-react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { occupancyColor, computeRackStats, computeShelfStats, isProductLow } from "../utils";
import WarehouseShelfFormModal from "./WarehouseShelfFormModal";

// rack.shelfData[] -> { shelfCode, productData: [{ productInfo, group, stock }] }
//
// NOTE: adding a brand new product to a shelf requires picking an existing
// Product document (productInfo is a ref, not free text), so that flow
// isn't wired up here yet — it needs a product picker/search once that API
// is available. Existing product stock (inStock) can be adjusted inline.
const WarehouseRackModal = ({
  rack,
  isOpen,
  onClose,
  onUpdateProductStock,
  onAddShelf,
}) => {
  const [isShelfFormOpen, setIsShelfFormOpen] = useState(false);

  if (!rack) return null;

  const { itemCount, capacity } = computeRackStats(rack);
  const shelves = rack.shelfData || [];

  const handleAddShelf = async (payload) => {
    return onAddShelf(rack, payload);
  };

  return (
    <>
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
                  Rack {rack.rackCode}
                  <span className="text-[11px] font-semibold text-emerald-700/50">
                    ({itemCount}/{capacity})
                  </span>
                  {rack.group?.groupName && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {rack.group.groupName}
                    </span>
                  )}
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
                {shelves.length === 0 ? (
                  <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                    This rack has no shelves yet.
                  </p>
                ) : (
                  shelves.map((shelf) => {
                    const shelfStats = computeShelfStats(shelf);
                    const shelfColor = occupancyColor(shelfStats.itemCount, shelfStats.capacity);
                    const products = shelf.productData || [];

                    return (
                      <div
                        key={shelf._id}
                        className="rounded-xl border border-emerald-300/40 bg-white/50 p-3 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <Layers size={12} className="text-emerald-600" />
                            {shelf.shelfCode}
                          </span>
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                            style={shelfColor.style}
                          >
                            {shelfStats.itemCount}/{shelfStats.capacity}
                          </span>
                        </div>

                        {products.length === 0 ? (
                          <p className="text-[11px] text-emerald-700/40 font-semibold py-1 text-center flex items-center justify-center gap-1">
                            <PackageOpen size={12} />
                            Empty shelf
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {products.map((p) => {
                              const inStock = p.stock?.inStock ?? 0;
                              const maxStock = p.stock?.maxStock ?? 0;
                              const pColor = occupancyColor(inStock, maxStock);
                              const pPct = maxStock > 0 ? (inStock / maxStock) * 100 : 0;
                              const low = isProductLow(p);

                              return (
                                <div
                                  key={p._id}
                                  className="flex flex-col gap-1 px-2 py-1.5 rounded-lg bg-white/60 border border-emerald-300/30"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-semibold text-emerald-900 truncate flex-1 flex items-center gap-1">
                                      {p.productInfo?.name}
                                      {low && (
                                        <AlertTriangle
                                          size={11}
                                          className="text-red-500 shrink-0"
                                          title="Low stock"
                                        />
                                      )}
                                    </span>
                                    <div
                                      className="flex items-center gap-1 shrink-0 rounded px-1 py-0.5"
                                      style={{
                                        backgroundColor: pColor.style.backgroundColor,
                                      }}
                                    >
                                      <input
                                        type="number"
                                        min="0"
                                        max={maxStock}
                                        value={inStock}
                                        onChange={(e) =>
                                          onUpdateProductStock(
                                            shelf._id,
                                            p._id,
                                            e.target.value,
                                          )
                                        }
                                        className="w-10 bg-white/70 rounded text-[10px] font-bold text-center border border-black/10 py-0.5"
                                      />
                                      <span className="text-[10px] font-bold">/</span>
                                      <span className="text-[10px] font-bold px-1">
                                        {maxStock}
                                      </span>
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
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add shelf */}
              <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-emerald-100">
                <button
                  onClick={() => setIsShelfFormOpen(true)}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors"
                  style={{ backgroundColor: PALETTE.mint }}
                >
                  <Plus size={15} />
                  Add Shelf
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WarehouseShelfFormModal
        isOpen={isShelfFormOpen}
        rack={rack}
        onClose={() => setIsShelfFormOpen(false)}
        onSubmit={handleAddShelf}
      />
    </>
  );
};

export default WarehouseRackModal;
