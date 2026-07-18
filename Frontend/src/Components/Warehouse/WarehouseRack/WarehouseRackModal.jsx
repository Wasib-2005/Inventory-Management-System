import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  X,
  Plus,
  PackageOpen,
  Layers,
  AlertTriangle,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
} from "lucide-react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import {
  occupancyColor,
  computeRackStats,
  computeShelfStats,
  isProductLow,
} from "../utils";
import WarehouseShelfFormModal from "./WarehouseShelfFormModal";
import WarehouseShelfProductPicker from "./WarehouseShelfProductPicker";

const WarehouseRackModal = ({
  rack,
  isOpen,
  onClose,
  onUpdateProductStock,
  onRemoveProductFromShelf,
  onAddShelf,
  onEditRack,
  onDeleteRack,
  onToggleRackStatus,
  onRestoreRack,
  onEditShelf,
  onDeleteShelf,
  onToggleShelfStatus,
  onRestoreShelf,
  onSearchProducts,
  onAddProductToShelf,
}) => {
  const [shelfForm, setShelfForm] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });
  const [productPickerShelf, setProductPickerShelf] = useState(null);

  // stockErrors: key `${productId}-${field}` -> error message (or undefined)
  const [stockErrors, setStockErrors] = useState({});
  // rawStockInputs: key `${productId}-${field}` -> in-progress text while
  // typing, only used so the field can be momentarily empty while editing.
  const [rawStockInputs, setRawStockInputs] = useState({});

  if (!rack) return null;

  const { itemCount, capacity } = computeRackStats(rack);
  const shelves = rack.shelfData || [];

  // Only whole non-negative numbers allowed. Empty string is allowed
  // transiently (user clearing the field to retype) but is NOT sent
  // to the backend until it resolves to a real digit string.
  const isValidDigits = (raw) => raw === "" || /^\d+$/.test(raw);

  const validateRelation = (nextInStock, nextMaxStock) => {
    if (nextInStock > nextMaxStock) {
      return "In-stock cannot exceed max stock.";
    }
    return null;
  };

  const getDisplayValue = (productId, field, actualValue) => {
    const key = `${productId}-${field}`;
    return rawStockInputs[key] !== undefined
      ? rawStockInputs[key]
      : String(actualValue);
  };

  const setError = (productId, field, message) => {
    const key = `${productId}-${field}`;
    setStockErrors((prev) => ({ ...prev, [key]: message }));
  };

  const clearRaw = (productId, field) => {
    const key = `${productId}-${field}`;
    setRawStockInputs((prev) => {
      if (!(key in prev)) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Shared handler for the Warn / In / Max inputs.
  // - Non-numeric text: value never changes, error shown, nothing sent.
  // - Empty string: value stays as-is on screen (user is mid-edit),
  //   nothing sent yet.
  // - Valid digits: value updates + relational check runs + sent upstream
  //   only if the relation is still valid.
  const handleStockFieldChange = ({
    raw,
    productId,
    shelfId,
    field,
    currentInStock,
    currentMaxStock,
  }) => {
    if (!isValidDigits(raw)) {
      // Block it entirely: don't touch rawStockInputs (so the input's
      // displayed value doesn't change) and don't call onUpdateProductStock.
      setError(productId, field, "Only numbers are allowed.");
      return;
    }

    const key = `${productId}-${field}`;
    setRawStockInputs((prev) => ({ ...prev, [key]: raw }));

    if (raw === "") {
      // Mid-edit (cleared field) — hold, don't send yet, don't error.
      setError(productId, field, null);
      return;
    }

    const nextValue = Number(raw);
    const nextInStock = field === "inStock" ? nextValue : currentInStock;
    const nextMaxStock = field === "maxStock" ? nextValue : currentMaxStock;
    const relationError = validateRelation(nextInStock, nextMaxStock);

    setError(productId, field, relationError);

    if (relationError) {
      // Don't send an invalid in/max relationship to the backend.
      return;
    }

    onUpdateProductStock(shelfId, productId, field, nextValue);
  };

  const handleStockFieldBlur = ({
    raw,
    productId,
    shelfId,
    field,
    currentInStock,
    currentMaxStock,
  }) => {
    if (!isValidDigits(raw)) {
      // Shouldn't normally happen (invalid text never reaches raw state),
      // but guard anyway: just clear back to the last known-good value.
      clearRaw(productId, field);
      setError(productId, field, null);
      return;
    }

    if (raw === "") {
      // Field left empty on blur — fall back to 0 and commit.
      const nextInStock = field === "inStock" ? 0 : currentInStock;
      const nextMaxStock = field === "maxStock" ? 0 : currentMaxStock;
      const relationError = validateRelation(nextInStock, nextMaxStock);

      clearRaw(productId, field);
      setError(productId, field, relationError);

      if (!relationError) {
        onUpdateProductStock(shelfId, productId, field, 0);
      }
      return;
    }

    clearRaw(productId, field);
  };

  const handleAddShelfSubmit = async (payload) => {
    if (shelfForm.mode === "create") {
      return onAddShelf(rack, payload);
    }
    return onEditShelf(shelfForm.initialData._id, payload);
  };

  const openAddShelf = () =>
    setShelfForm({ isOpen: true, mode: "create", initialData: null });
  const openEditShelf = (shelf) =>
    setShelfForm({ isOpen: true, mode: "edit", initialData: shelf });
  const closeShelfForm = () =>
    setShelfForm({ isOpen: false, mode: "create", initialData: null });

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
              <div className="flex items-center justify-between shrink-0 gap-2">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 min-w-0">
                  <Package
                    size={16}
                    color={PALETTE.steel}
                    className="shrink-0"
                  />
                  <span className="truncate">Rack {rack.rackCode}</span>
                  <span className="text-[11px] font-semibold text-emerald-700/50 shrink-0">
                    ({itemCount}/{capacity})
                  </span>
                  {rack.group?.groupName && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      {rack.group.groupName}
                    </span>
                  )}
                  {rack.isDeleted && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                      Deleted
                    </span>
                  )}
                  {rack.disabled && !rack.isDeleted && (
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                      Disabled
                    </span>
                  )}
                </h3>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onEditRack(rack)}
                    title="Edit rack"
                    className="p-1.5 rounded-md bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 border border-amber-200/50 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  {rack.isDeleted ? (
                    <button
                      onClick={() => onRestoreRack(rack._id)}
                      title="Restore rack"
                      className="p-1.5 rounded-md bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 border border-blue-200/50 transition-colors"
                    >
                      <RotateCcw size={13} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleRackStatus(rack)}
                        title={rack.disabled ? "Enable rack" : "Disable rack"}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/50 transition-colors"
                      >
                        <Power size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteRack(rack._id)}
                        title="Delete rack"
                        className="p-1.5 rounded-md bg-red-50/70 hover:bg-red-100/80 text-red-700 border border-red-200/50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="text-emerald-700/50 hover:text-emerald-900 transition-colors ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Shelves list */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {rack.isDeleted || shelves.length === 0 ? (
                  <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                    {rack.isDeleted
                      ? "This rack has been deleted"
                      : "This rack has no shelves yet."}
                  </p>
                ) : (
                  shelves.map((shelf) => {
                    const shelfStats = computeShelfStats(shelf);
                    const shelfColor = occupancyColor(
                      shelfStats.itemCount,
                      shelfStats.capacity,
                    );
                    const products = shelf.productData || [];

                    return (
                      <div
                        key={shelf._id}
                        className={`rounded-xl border border-emerald-300/40 bg-white/50 p-3 flex flex-col gap-2.5 ${
                          shelf.isDeleted || shelf.disabled ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 min-w-0">
                            <Layers
                              size={12}
                              className="text-emerald-600 shrink-0"
                            />
                            <span className="truncate">{shelf.shelfCode}</span>
                            {shelf.isDeleted && (
                              <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 py-0.5 rounded shrink-0">
                                Deleted
                              </span>
                            )}
                            {shelf.disabled && !shelf.isDeleted && (
                              <span className="text-[9px] font-bold text-slate-700 bg-slate-200 px-1 py-0.5 rounded shrink-0">
                                Disabled
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                              style={shelfColor.style}
                            >
                              {shelfStats.itemCount}/{shelfStats.capacity}
                            </span>

                            {!shelf.isDeleted && (
                              <button
                                onClick={() => setProductPickerShelf(shelf)}
                                title="Add product"
                                className="p-1 rounded bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/50 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => openEditShelf(shelf)}
                              title="Edit shelf"
                              className="p-1 rounded bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 border border-amber-200/50 transition-colors"
                            >
                              <Edit2 size={12} />
                            </button>
                            {shelf.isDeleted ? (
                              <button
                                onClick={() => onRestoreShelf(shelf._id)}
                                title="Restore shelf"
                                className="p-1 rounded bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 border border-blue-200/50 transition-colors"
                              >
                                <RotateCcw size={12} />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => onToggleShelfStatus(shelf)}
                                  title={
                                    shelf.disabled
                                      ? "Enable shelf"
                                      : "Disable shelf"
                                  }
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/50 transition-colors"
                                >
                                  <Power size={12} />
                                </button>
                                <button
                                  onClick={() => onDeleteShelf(shelf._id)}
                                  title="Delete shelf"
                                  className="p-1 rounded bg-red-50/70 hover:bg-red-100/80 text-red-700 border border-red-200/50 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
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
                              const warningStock = p.stock?.warningStock ?? 0;
                              const pColor = occupancyColor(inStock, maxStock);
                              const pPct =
                                maxStock > 0 ? (inStock / maxStock) * 100 : 0;
                              const low = isProductLow(p);
                              const productId = p.productInfo?._id;

                              const warnError =
                                stockErrors[`${productId}-warningStock`];
                              const inError =
                                stockErrors[`${productId}-inStock`];
                              const maxError =
                                stockErrors[`${productId}-maxStock`];
                              // Show whichever error is present (first one found).
                              const rowError = warnError || inError || maxError;

                              return (
                                <div
                                  key={p._id}
                                  className="flex flex-col gap-1.5 px-2.5 py-2 rounded-lg bg-white/60 border border-emerald-300/30"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[12px] font-semibold text-emerald-900 truncate">
                                          {p.productInfo?.name}
                                        </span>
                                        {low && (
                                          <AlertTriangle
                                            size={11}
                                            className="text-red-500 shrink-0"
                                            title="Low stock"
                                          />
                                        )}
                                      </div>

                                      {(p.productInfo?.brand ||
                                        p.productInfo?.sku ||
                                        p.productInfo?.displayId) && (
                                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                          {p.productInfo?.brand && (
                                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/50">
                                              {p.productInfo.brand}
                                            </span>
                                          )}
                                          {p.productInfo?.sku && (
                                            <span className="text-[9px] font-semibold text-slate-600">
                                              SKU:{p.productInfo.sku}
                                            </span>
                                          )}
                                          {p.productInfo?.displayId && (
                                            <span className="text-[9px] font-semibold text-slate-500">
                                              #{p.productInfo.displayId}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <div
                                        className="flex items-center gap-1 rounded px-1.5 py-1"
                                        style={{
                                          backgroundColor:
                                            pColor.style.backgroundColor,
                                        }}
                                      >
                                        {/* Warning Stock Column */}
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="text-[8px] font-bold">
                                            Warn
                                          </span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDisplayValue(
                                              productId,
                                              "warningStock",
                                              warningStock,
                                            )}
                                            onChange={(e) =>
                                              handleStockFieldChange({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "warningStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            onBlur={(e) =>
                                              handleStockFieldBlur({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "warningStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            className={`w-10 bg-white/70 rounded text-[10px] font-bold text-center border py-0.5 ${
                                              warnError
                                                ? "border-red-500"
                                                : "border-black/10"
                                            }`}
                                          />
                                        </div>
                                        {/* Separator / Spacer */}
                                        <div className="w-[1px] h-6 bg-black/10 mx-0.5" />
                                        {/* In Stock Column */}
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="text-[8px] font-bold">
                                            In
                                          </span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDisplayValue(
                                              productId,
                                              "inStock",
                                              inStock,
                                            )}
                                            onChange={(e) =>
                                              handleStockFieldChange({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "inStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            onBlur={(e) =>
                                              handleStockFieldBlur({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "inStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            className={`w-10 bg-white/70 rounded text-[10px] font-bold text-center border py-0.5 ${
                                              inError
                                                ? "border-red-500"
                                                : "border-black/10"
                                            }`}
                                          />
                                        </div>
                                        <p className="text-2xl">/</p>
                                        {/* Max Stock Column */}
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="text-[8px] font-bold">
                                            Max
                                          </span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            value={getDisplayValue(
                                              productId,
                                              "maxStock",
                                              maxStock,
                                            )}
                                            onChange={(e) =>
                                              handleStockFieldChange({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "maxStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            onBlur={(e) =>
                                              handleStockFieldBlur({
                                                raw: e.target.value,
                                                productId,
                                                shelfId: shelf._id,
                                                field: "maxStock",
                                                currentInStock: inStock,
                                                currentMaxStock: maxStock,
                                              })
                                            }
                                            className={`w-10 bg-white/70 rounded text-[10px] font-bold text-center border py-0.5 ${
                                              maxError
                                                ? "border-red-500"
                                                : "border-black/10"
                                            }`}
                                          />
                                        </div>
                                      </div>

                                      <button
                                        onClick={() =>
                                          onRemoveProductFromShelf(
                                            shelf._id,
                                            productId,
                                          )
                                        }
                                        title="Remove product from shelf"
                                        className="p-1 rounded bg-red-50/70 hover:bg-red-100/80 text-red-700 border border-red-200/50 transition-colors self-center"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                                      style={{
                                        width: `${Math.min(pPct, 100)}%`,
                                      }}
                                    />
                                  </div>

                                  {rowError && (
                                    <p className="text-[9px] font-semibold text-red-600">
                                      {rowError}
                                    </p>
                                  )}
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
                  onClick={openAddShelf}
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
        isOpen={shelfForm.isOpen}
        mode={shelfForm.mode}
        rack={rack}
        initialData={shelfForm.initialData}
        onClose={closeShelfForm}
        onSubmit={handleAddShelfSubmit}
        onDelete={onDeleteShelf}
        onToggleStatus={onToggleShelfStatus}
        onRestore={onRestoreShelf}
      />

      <WarehouseShelfProductPicker
        isOpen={!!productPickerShelf}
        shelf={productPickerShelf}
        onClose={() => setProductPickerShelf(null)}
        onSearchProducts={onSearchProducts}
        onSubmit={(payload) => onAddProductToShelf(productPickerShelf, payload)}
      />
    </>
  );
};

export default WarehouseRackModal;