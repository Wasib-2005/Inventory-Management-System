import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiArrowDownLeft, FiArrowUpRight, FiPlus } from "react-icons/fi";
import { AiOutlineBarcode } from "react-icons/ai";
import ProductSearchPanel from "./ProductSearchPanel";
import WarehouseSelect from "./WarehouseSelect";
import MovementItemsList from "./MovementItemsList";
import TransferTypeSelector from "./TransferTypeSelector";
import CurrentWarehouseDisplay from "./CurrentWarehouseDisplay";
import UserSelectField from "./UserSelectField";
import RackSelect from "./RackSelect";
import CycleCountShelfEntry from "./CycleCountShelfEntry";
import { useWarehouseDetails } from "./useWarehouseDetails";
import { createStockMovement } from "./api";

const CONFIG = {
  inbound: {
    title: "Receive Inbound",
    icon: FiArrowDownLeft,
    submitLabel: "Confirm Receipt",
    accent: "bg-emerald-600 hover:bg-emerald-700",
  },
  outbound: {
    title: "Dispatch Outbound",
    icon: FiArrowUpRight,
    submitLabel: "Confirm Dispatch",
    accent: "bg-amber-600 hover:bg-amber-700",
  },
  count: {
    title: "Cycle Count",
    icon: AiOutlineBarcode,
    submitLabel: "Save Count",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
};

const INBOUND_OPTIONS = [
  { id: "shipment", label: "Shipment → Warehouse" },
  { id: "warehouse", label: "Warehouse → Warehouse" },
];

const OUTBOUND_OPTIONS = [
  { id: "shipment", label: "Warehouse → Shipment" },
  { id: "warehouse", label: "Warehouse → Warehouse" },
];

let shelfEntrySeq = 0;
const newShelfEntry = () => ({
  id: `shelf-${Date.now()}-${shelfEntrySeq++}`,
  mode: "existing", // "existing" | "custom"
  shelfId: "",
  customShelfCode: "",
  items: [],
});

const StockMovementModal = ({ type, isOpen, onClose, onCreated }) => {
  const {
    selectedWarehouseId,
    warehouse,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useWarehouseDetails();

  // Inbound / Outbound transfer fields
  const [transferType, setTransferType] = useState("shipment");
  const [otherWarehouseId, setOtherWarehouseId] = useState("");
  const [trackCode, setTrackCode] = useState("");
  const [handledBy, setHandledBy] = useState(null);

  // Cycle count fields
  const [rackId, setRackId] = useState("");
  const [countedBy, setCountedBy] = useState(null);
  const [shelfEntries, setShelfEntries] = useState([newShelfEntry()]);

  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]); // inbound/outbound only
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const racks = warehouse?.rackdata || [];
  const selectedRack = racks.find((r) => r._id === rackId) || null;
  const rackShelves = selectedRack?.shelfData || [];

  // Reset shelves whenever the rack changes
  useEffect(() => {
    setShelfEntries([newShelfEntry()]);
  }, [rackId]);

  if (!isOpen) return null;

  const isInbound = type === "inbound";
  const isOutbound = type === "outbound";
  const isCount = type === "count";
  const config = CONFIG[type];
  const Icon = config.icon;
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

  // ---- Inbound / Outbound item handlers ----
  const handleSelectProduct = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: Number(i.qty) + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          cartId: `${product._id}-${Date.now()}`,
          productId: product._id,
          name: product.name,
          sku: product.sku,
          qty: 1,
          stock: Number(product.stock) || 0,
        },
      ];
    });
  };
  const handleUpdateItem = (cartId, patch) =>
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, ...patch } : i)),
    );
  const handleRemoveItem = (cartId) =>
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));

  // ---- Cycle count shelf/item handlers ----
  const handleAddShelfEntry = () =>
    setShelfEntries((prev) => [...prev, newShelfEntry()]);

  const handleRemoveShelfEntry = (entryId) =>
    setShelfEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((e) => e.id !== entryId),
    );

  const handleShelfModeChange = (entryId, mode) =>
    setShelfEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, mode, shelfId: "", customShelfCode: "", items: [] }
          : e,
      ),
    );

  const handleShelfChange = (entryId, shelfId) =>
    setShelfEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, shelfId, items: [] } : e)),
    );

  const handleCustomShelfCodeChange = (entryId, code) =>
    setShelfEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, customShelfCode: code } : e)),
    );

  const handleSelectShelfProduct = (entryId, product) =>
    setShelfEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const existing = e.items.find((i) => i.productId === product._id);
        const nextItems = existing
          ? e.items.map((i) =>
              i.productId === product._id
                ? { ...i, qty: Number(i.qty) + 1 }
                : i,
            )
          : [
              ...e.items,
              {
                cartId: `${product._id}-${Date.now()}`,
                productId: product._id,
                name: product.name,
                sku: product.sku,
                qty: 0,
                stock: Number(product.stock) || 0,
              },
            ];
        return { ...e, items: nextItems };
      }),
    );

  const handleUpdateShelfItem = (entryId, cartId, patch) =>
    setShelfEntries((prev) =>
      prev.map((e) =>
        e.id !== entryId
          ? e
          : {
              ...e,
              items: e.items.map((i) =>
                i.cartId === cartId ? { ...i, ...patch } : i,
              ),
            },
      ),
    );

  const handleRemoveShelfItem = (entryId, cartId) =>
    setShelfEntries((prev) =>
      prev.map((e) =>
        e.id !== entryId
          ? e
          : { ...e, items: e.items.filter((i) => i.cartId !== cartId) },
      ),
    );

  const resetForm = () => {
    setTransferType("shipment");
    setOtherWarehouseId("");
    setTrackCode("");
    setHandledBy(null);
    setRackId("");
    setCountedBy(null);
    setShelfEntries([newShelfEntry()]);
    setReference("");
    setNotes("");
    setItems([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedWarehouseId) {
      setError("No warehouse selected — pick one from the top nav first");
      return;
    }

    if (isInbound || isOutbound) {
      if (transferType === "warehouse" && !otherWarehouseId) {
        setError(
          `Select the ${isInbound ? "source" : "destination"} warehouse`,
        );
        return;
      }
      if (isInbound && !handledBy) {
        setError("Select who received this shipment");
        return;
      }
      if (items.length === 0) {
        setError("Add at least one product");
        return;
      }
      if (items.some((i) => Number(i.qty) <= 0)) {
        setError("Every line needs a quantity greater than 0");
        return;
      }
    }

    if (isCount) {
      if (!rackId) {
        setError("Select a rack");
        return;
      }
      if (!countedBy) {
        setError("Select who counted this rack");
        return;
      }

      const filledEntries = shelfEntries.filter((e) =>
        e.mode === "custom" ? e.customShelfCode.trim() : e.shelfId,
      );
      if (filledEntries.length === 0) {
        setError("Add at least one shelf");
        return;
      }
      if (filledEntries.some((e) => e.items.length === 0)) {
        setError("Every shelf needs at least one counted product");
        return;
      }

      // Guard against a custom code that collides with an existing shelf
      // code on this rack, or the same custom code typed more than once.
      const existingCodes = new Set(
        rackShelves.map((s) => s.shelfCode.trim().toLowerCase()),
      );
      const customCodes = filledEntries
        .filter((e) => e.mode === "custom")
        .map((e) => e.customShelfCode.trim().toLowerCase());
      const seen = new Set();
      for (const code of customCodes) {
        if (existingCodes.has(code)) {
          setError(
            `Shelf code "${code}" already exists on this rack — select it from Existing instead`,
          );
          return;
        }
        if (seen.has(code)) {
          setError(`Shelf code "${code}" was entered more than once`);
          return;
        }
        seen.add(code);
      }
    }

    setIsSubmitting(true);
    try {
      let payload;

      if (isInbound || isOutbound) {
        const baseItems = items.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          qty: Number(i.qty) || 0,
          stock: Number(i.stock) || 0,
        }));

        payload = isInbound
          ? {
              reference,
              notes,
              items: baseItems,
              sourceType: transferType,
              fromWarehouseId:
                transferType === "warehouse" ? otherWarehouseId : null,
              toWarehouseId: selectedWarehouseId,
              trackCode,
              receivedBy: {
                userId: handledBy._id,
                displayName: handledBy.displayName || handledBy.username,
              },
            }
          : {
              reference,
              notes,
              items: baseItems,
              destinationType: transferType,
              fromWarehouseId: selectedWarehouseId,
              toWarehouseId:
                transferType === "warehouse" ? otherWarehouseId : null,
              trackCode,
              dispatchedBy: handledBy
                ? {
                    userId: handledBy._id,
                    displayName: handledBy.displayName || handledBy.username,
                  }
                : null,
            };
      } else {
        payload = {
          notes,
          warehouseId: selectedWarehouseId,
          rackId,
          rackCode: selectedRack?.rackCode,
          countedBy: {
            userId: countedBy._id,
            displayName: countedBy.displayName || countedBy.username,
          },
          shelves: shelfEntries
            .filter((e) =>
              e.mode === "custom" ? e.customShelfCode.trim() : e.shelfId,
            )
            .map((e) => {
              const isCustomShelf = e.mode === "custom";
              const shelfMeta = isCustomShelf
                ? null
                : rackShelves.find((s) => s._id === e.shelfId);
              return {
                shelfId: isCustomShelf ? null : e.shelfId,
                shelfCode: isCustomShelf
                  ? e.customShelfCode.trim()
                  : shelfMeta?.shelfCode,
                isNewShelf: isCustomShelf,
                items: e.items.map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  sku: i.sku,
                  qty: Number(i.qty) || 0,
                })),
              };
            }),
        };
      }

      const res = await createStockMovement(type, payload);
      onCreated?.(res.data?.data);
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <div className="flex items-center gap-2">
            <Icon className="text-emerald-600" size={18} />
            <h3 className="font-bold text-emerald-900">{config.title}</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {(isInbound || isOutbound) && (
            <>
              <TransferTypeSelector
                label={isInbound ? "Source" : "Destination"}
                options={isInbound ? INBOUND_OPTIONS : OUTBOUND_OPTIONS}
                value={transferType}
                onChange={setTransferType}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isInbound ? (
                  <>
                    <div
                      className={
                        transferType === "warehouse" ? "" : "sm:col-span-2"
                      }
                    >
                      <CurrentWarehouseDisplay
                        label="To (Current Warehouse)"
                        warehouse={warehouse}
                        isLoading={warehouseLoading}
                        error={warehouseError}
                      />
                    </div>
                    {transferType === "warehouse" && (
                      <WarehouseSelect
                        label="From"
                        value={otherWarehouseId}
                        onChange={setOtherWarehouseId}
                        excludeId={selectedWarehouseId}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={
                        transferType === "warehouse" ? "" : "sm:col-span-2"
                      }
                    >
                      <CurrentWarehouseDisplay
                        label="From (Current Warehouse)"
                        warehouse={warehouse}
                        isLoading={warehouseLoading}
                        error={warehouseError}
                      />
                    </div>
                    {transferType === "warehouse" ? (
                      <WarehouseSelect
                        label="To"
                        value={otherWarehouseId}
                        onChange={setOtherWarehouseId}
                        excludeId={selectedWarehouseId}
                      />
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                          To
                        </label>
                        <div className="flex items-center px-3 py-2 rounded-lg border border-amber-300/50 bg-amber-50/50 min-h-[38px]">
                          <p className="text-xs font-semibold text-amber-800">
                            Shipment (external)
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                    Track Code
                  </label>
                  <input
                    type="text"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder="Tracking / AWB number"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
                <UserSelectField
                  label={isInbound ? "Received By" : "Dispatched By"}
                  value={handledBy}
                  onChange={setHandledBy}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                  Reference (optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="PO number, note, etc."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>

              <ProductSearchPanel onSelectProduct={handleSelectProduct} />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                    Products ({items.length})
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700/50 uppercase">
                    Total units: {totalUnits}
                  </span>
                </div>
                <MovementItemsList
                  type={type}
                  items={items}
                  onUpdateItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </>
          )}

          {isCount && (
            <>
              <CurrentWarehouseDisplay
                label="Warehouse"
                warehouse={warehouse}
                isLoading={warehouseLoading}
                error={warehouseError}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RackSelect
                  racks={racks}
                  value={rackId}
                  onChange={setRackId}
                  disabled={warehouseLoading}
                />
                <UserSelectField
                  label="Counted By"
                  value={countedBy}
                  onChange={setCountedBy}
                />
              </div>

              {!rackId ? (
                <p className="text-[12px] text-emerald-700/50 italic py-3 text-center border border-dashed border-emerald-300/40 rounded-lg">
                  Select a rack to start adding shelves
                </p>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                      Shelves (
                      {
                        shelfEntries.filter((e) =>
                          e.mode === "custom"
                            ? e.customShelfCode.trim()
                            : e.shelfId,
                        ).length
                      }
                      )
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddShelfEntry}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 transition-colors"
                    >
                      <FiPlus size={12} /> Add Shelf
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {shelfEntries.map((entry, idx) => (
                      <CycleCountShelfEntry
                        key={entry.id}
                        entry={{
                          ...entry,
                          excludedShelfIds: shelfEntries
                            .filter((e) => e.id !== entry.id && e.shelfId)
                            .map((e) => e.shelfId),
                        }}
                        index={idx}
                        availableShelves={rackShelves}
                        onShelfChange={handleShelfChange}
                        onCustomShelfCodeChange={handleCustomShelfCodeChange}
                        onModeChange={handleShelfModeChange}
                        onRemoveEntry={handleRemoveShelfEntry}
                        onSelectProduct={handleSelectShelfProduct}
                        onUpdateItem={handleUpdateShelfItem}
                        onRemoveItem={handleRemoveShelfItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything worth noting about this movement..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-none"
            />
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 ${config.accent}`}
          >
            {isSubmitting ? "Saving..." : config.submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StockMovementModal;
