import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiPlus } from "react-icons/fi";
import ProductSearchPanel from "./ProductSearchPanel";
import WarehouseSelect from "./WarehouseSelect";
import MovementItemsList from "./MovementItemsList";
import TransferTypeSelector from "./TransferTypeSelector";
import CurrentWarehouseDisplay from "./CurrentWarehouseDisplay";
import UserSelectField from "./UserSelectField";
import { useWarehouseDetails } from "./useWarehouseDetails";
import CycleCountRackBlock from "../CycleCountRackBlock";
import {
  createStockMovement,
  createCycleCount,
  updateStockMovement,
  getWarehouseById,
} from "../api";
import { MOVEMENT_TYPES, MOVEMENT_TYPE_META } from "./movementConstants";
import SupplierSearchField from "../SupplierSearchField";
import { formatNumber } from "../../../../utility/formatNumber";

const INBOUND_OPTIONS = [
  { id: "shipment", label: "Supplier → Warehouse" },
  { id: "warehouse", label: "Warehouse → Warehouse" },
];

const OUTBOUND_OPTIONS = [
  { id: "shipment", label: "Warehouse → Supplier" },
  { id: "warehouse", label: "Warehouse → Warehouse" },
];

const RACK_MODES = [
  { id: "all", label: "All Racks" },
  { id: "specific", label: "Specific Racks" },
];

let rackEntrySeq = 0;
const newRackEntry = () => ({
  id: `rack-${Date.now()}-${rackEntrySeq++}`,
  rackId: "",
  shelfMode: "all", // "all" | "one"
  shelfId: "",
});

const toDateTimeLocal = (value) => {
  const d = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Create OR edit an inbound / outbound / cycle-count movement.
 * Pass `record` (a movement previously loaded from the list) to edit it —
 * the type switcher is locked in that case since a movement's type
 * shouldn't change after creation.
 */
const StockMovementModal = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  initialType = "inbound",
  record = null,
}) => {
  const isEditMode = !!record;

  const [type, setType] = useState(record?._type || initialType);

  const {
    selectedWarehouseId,
    warehouse,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useWarehouseDetails();

  // Shared
  const [date, setDate] = useState(
    toDateTimeLocal(record?.date || record?.createdAt),
  );
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Inbound / Outbound
  const [transferType, setTransferType] = useState("shipment");
  const [otherWarehouseId, setOtherWarehouseId] = useState("");
  const [trackCode, setTrackCode] = useState("");
  const [handledBy, setHandledBy] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [supplyDate, setSupplyDate] = useState("");
  const [items, setItems] = useState([]);

  // Cycle count — no products, just who / where / rack-and-shelf scope
  const [countedBy, setCountedBy] = useState(null);
  const [countWarehouseId, setCountWarehouseId] = useState("");
  const [countWarehouse, setCountWarehouse] = useState(null);
  const [countWarehouseLoading, setCountWarehouseLoading] = useState(false);
  const [rackMode, setRackMode] = useState("all"); // "all" | "specific"
  const [rackEntries, setRackEntries] = useState([newRackEntry()]);

  const isInbound = type === "inbound";
  const isOutbound = type === "outbound";
  const isCount = type === "count";
  const racks = countWarehouse?.rackdata || [];

  // Populate from `record` (edit mode) or reset (create mode) whenever the
  // modal is opened.
  useEffect(() => {
    if (!isOpen) return;

    if (record) {
      setType(record._type);
      setDate(toDateTimeLocal(record.date || record.createdAt));
      setReference(record.reference || "");
      setNotes(record.notes || "");
      setTrackCode(record.trackCode || "");
      setTransferType(
        record.sourceType || record.destinationType || "shipment",
      );
      setOtherWarehouseId(
        record.fromWarehouseId?._id || record.toWarehouseId?._id || "",
      );
      setHandledBy(record.receivedBy || record.dispatchedBy || null);
      setSupplier(record.supplier || null);
      setSupplyDate(toDateInputValue(record.supplyDate));
      setItems(
        (record.items || []).map((i) => {
          const product = i.productData || i.product || {};
          return {
            ...i,
            productId: product._id || i.productId,
            name: product.name || i.name,
            sku: product.sku || i.sku,
            image: product.image || i.image,
            cartId: `${product._id || i.productId}-${Date.now()}-${Math.random()}`,
          };
        }),
      );
      setCountedBy(record.countedBy || null);
      setCountWarehouseId(record.warehouseId?._id || record.warehouseId || "");
      setRackMode(record.rackScope || "all");
      // TODO: mapping from record.racks back into rackEntries is best-effort —
      // confirm the real backend shape once the update endpoint is wired up.
      setRackEntries(
        record.racks?.length
          ? record.racks.map((r) => ({
              id: `rack-${Date.now()}-${rackEntrySeq++}`,
              rackId: r.rackId || "",
              shelfMode: r.shelfScope || "all",
              shelfId: r.shelfId || "",
            }))
          : [newRackEntry()],
      );
    } else {
      setType(initialType);
      setDate(toDateTimeLocal());
      setReference("");
      setNotes("");
      setTrackCode("");
      setTransferType("shipment");
      setOtherWarehouseId("");
      setHandledBy(null);
      setSupplier(null);
      setSupplyDate("");
      setItems([]);
      setCountedBy(null);
      setCountWarehouseId("");
      setRackMode("all");
      setRackEntries([newRackEntry()]);
    }
    setError("");
  }, [isOpen, record, initialType]);

  // Default the count warehouse to the currently active one (unless a
  // record already set it above).
  useEffect(() => {
    if (!isOpen || !isCount) return;
    if (!countWarehouseId && selectedWarehouseId) {
      setCountWarehouseId(selectedWarehouseId);
    }
  }, [isOpen, isCount, selectedWarehouseId, countWarehouseId]);

  // Load rack/shelf data for whichever warehouse is selected for the count.
  useEffect(() => {
    if (!isOpen || !isCount || !countWarehouseId) return;
    const controller = new AbortController();
    setCountWarehouseLoading(true);
    getWarehouseById(countWarehouseId, controller.signal)
      .then((res) => setCountWarehouse(res.data?.data || null))
      .catch((err) => {
        if (err.name !== "CanceledError") setCountWarehouse(null);
      })
      .finally(() => setCountWarehouseLoading(false));
    return () => controller.abort();
  }, [isOpen, isCount, countWarehouseId]);

  if (!isOpen) return null;

  const meta = MOVEMENT_TYPE_META[type];
  const Icon = meta.icon;
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

  // ---- Inbound / Outbound item handlers ----
  const handleSelectProduct = (product, shelf = null) => {
    const sourceLocation = shelf
      ? {
          rackId: shelf.rackData?._id,
          rackCode: shelf.rackData?.rackCode,
          shelfId: shelf.shelfId,
          shelfCode: shelf.shelfCode,
        }
      : undefined;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, qty: Number(i.qty) + 1, sourceLocation: sourceLocation || i.sourceLocation }
            : i,
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
          sourceLocation,
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

  // ---- Cycle count rack handlers ----
  const handleAddRack = () =>
    setRackEntries((prev) => [...prev, newRackEntry()]);
  const handleRemoveRack = (rackEntryId) =>
    setRackEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.id !== rackEntryId),
    );
  const handleRackChange = (rackEntryId, rackId) =>
    setRackEntries((prev) =>
      prev.map((r) =>
        r.id === rackEntryId
          ? { ...r, rackId, shelfMode: "all", shelfId: "" }
          : r,
      ),
    );
  const handleShelfModeChange = (rackEntryId, shelfMode) =>
    setRackEntries((prev) =>
      prev.map((r) =>
        r.id === rackEntryId ? { ...r, shelfMode, shelfId: "" } : r,
      ),
    );
  const handleShelfChange = (rackEntryId, shelfId) =>
    setRackEntries((prev) =>
      prev.map((r) => (r.id === rackEntryId ? { ...r, shelfId } : r)),
    );

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (isInbound || isOutbound) {
      if (!selectedWarehouseId) {
        setError("No warehouse selected — pick one from the top nav first");
        return;
      }
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
      if (isOutbound && items.some((item) => !item.sourceLocation?.rackId || !item.sourceLocation?.shelfId)) {
        setError("Select the source rack and shelves for every outbound product");
        return;
      }
    }

    if (isCount) {
      if (!countedBy) {
        setError("Select who counted this");
        return;
      }
      if (!countWarehouseId) {
        setError("Select a warehouse");
        return;
      }

      if (rackMode === "specific") {
        const usedRacks = rackEntries.filter((r) => r.rackId);
        if (usedRacks.length === 0) {
          setError("Add at least one rack, or switch to All Racks");
          return;
        }

        const rackIds = usedRacks.map((r) => r.rackId);
        if (new Set(rackIds).size !== rackIds.length) {
          setError("The same rack was selected more than once");
          return;
        }

        for (const r of usedRacks) {
          if (r.shelfMode === "one" && !r.shelfId) {
            const rack = racks.find((rk) => rk._id === r.rackId);
            setError(
              `Select shelves for rack "${rack?.rackCode}", or switch it to All Shelves`,
            );
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      let payload;

      if (isInbound || isOutbound) {
        const baseItems = items.map((i) => ({
          productData: i.productId,

          qty: Number(i.qty) || 0,
          sourceLocation: i.sourceLocation,
          destinationLocation: i.destinationLocation,
        }));

        const supplierPayload =
          transferType === "shipment" && supplier
            ? { supplierId: supplier._id, name: supplier.name }
            : null;
        const supplyDatePayload =
          transferType === "shipment" && supplyDate ? supplyDate : null;

        payload = isInbound
          ? {
              date,
              type,
              reference,
              notes,
              items: baseItems,
              destinationType: transferType,
              fromWarehouseId:
                transferType === "warehouse" ? otherWarehouseId : null,
              toWarehouseId: selectedWarehouseId,
              trackCode,
              supplier: supplierPayload?.supplierId,
              supplyDate: supplyDatePayload,
              receivedBy: handledBy._id,
            }
          : {
              date,
              type,
              reference,
              notes,
              items: baseItems,
              destinationType: transferType,
              fromWarehouseId: selectedWarehouseId,
              toWarehouseId:
                transferType === "warehouse" ? otherWarehouseId : null,
              trackCode,
              supplier: supplierPayload?.supplierId,
              supplyDate: supplyDatePayload,
              dispatchedBy: handledBy._id,
            };
      } else {
        // TODO: unconfirmed backend shape — cycle count no longer carries
        // products, just who counted, which warehouse, and rack/shelf scope.
        payload = {
          date,
          type,
          notes,
          warehouseId: countWarehouseId,
          countedBy: countedBy._id,
          rackScope: rackMode, // "all" | "specific"
          racks:
            rackMode === "all"
              ? []
              : rackEntries
                  .filter((r) => r.rackId)
                  .map((r) => {
                    const rack = racks.find((rk) => rk._id === r.rackId);
                    const shelf =
                      r.shelfMode === "one"
                        ? rack?.shelfData?.find((s) => s._id === r.shelfId)
                        : null;
                    return {
                      rackId: r.rackId,
                      rackCode: rack?.rackCode,
                      shelfScope: r.shelfMode, // "all" | "one"
                      shelfId: r.shelfMode === "one" ? r.shelfId : null,
                      shelfCode:
                        r.shelfMode === "one" ? shelf?.shelfCode : null,
                    };
                  }),
        };
      }

      const res = isEditMode
        ? await updateStockMovement(record._type, record._id, payload)
        : isCount
          ? await createCycleCount(payload)
          : await createStockMovement(payload);

      if (isEditMode) onUpdated?.(res.data?.data);
      else onCreated?.(res.data?.data);
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
            <h3 className="font-bold text-emerald-900">
              {isEditMode ? `Edit ${meta.label}` : meta.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Type switcher — locked once editing an existing record */}
        {!isEditMode && (
          <div className="flex p-1 mx-4 mt-3 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1">
            {MOVEMENT_TYPES.map((t) => {
              const tMeta = MOVEMENT_TYPE_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide py-1.5 px-2.5 rounded-md transition-colors ${
                    type === t
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-emerald-700/50 hover:text-emerald-700"
                  }`}
                >
                  {tMeta.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
              Date
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
          </div>

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
                    {transferType === "warehouse" ? (
                      <WarehouseSelect
                        label="From"
                        value={otherWarehouseId}
                        onChange={setOtherWarehouseId}
                        excludeId={selectedWarehouseId}
                      />
                    ) : (
                      <SupplierSearchField
                        label="From (Supplier)"
                        value={supplier}
                        onChange={setSupplier}
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
                      <SupplierSearchField
                        label="To (Supplier)"
                        value={supplier}
                        onChange={setSupplier}
                      />
                    )}
                  </>
                )}
              </div>

              {transferType === "shipment" && (
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
                    Supply Date{" "}
                    <span className="normal-case font-medium text-emerald-700/40">
                      (optional, recommended)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={supplyDate}
                    onChange={(e) => setSupplyDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
              )}

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
                    Total units: {formatNumber(totalUnits)}
                  </span>
                </div>
                <MovementItemsList
                  type={type}
                  items={items}
                  warehouse={warehouse}
                  onUpdateItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </>
          )}

          {isCount && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UserSelectField
                  label="Counted By"
                  value={countedBy}
                  onChange={setCountedBy}
                />
                <WarehouseSelect
                  label="Warehouse"
                  value={countWarehouseId}
                  onChange={setCountWarehouseId}
                />
              </div>

              <div className="flex p-1 rounded-lg bg-purple-900/5 border border-purple-300/30 gap-1">
                {RACK_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRackMode(m.id)}
                    className={`flex-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide py-1.5 px-2.5 rounded-md transition-colors ${
                      rackMode === m.id
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-purple-700/50 hover:text-purple-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {rackMode === "all" ? (
                <p className="text-[12px] text-purple-700/60 italic py-2 text-center border border-dashed border-purple-300/40 rounded-lg">
                  Every rack and shelves in this warehouse will be counted
                </p>
              ) : countWarehouseLoading ? (
                <p className="text-[12px] text-emerald-700/40 italic">
                  Loading racks...
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                      Racks ({rackEntries.filter((r) => r.rackId).length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddRack}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 transition-colors"
                    >
                      <FiPlus size={12} /> Add Rack
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
                    {rackEntries.map((rackEntry, idx) => (
                      <CycleCountRackBlock
                        key={rackEntry.id}
                        index={idx}
                        rackEntry={rackEntry}
                        racks={racks}
                        excludedRackIds={rackEntries
                          .filter((r) => r.id !== rackEntry.id && r.rackId)
                          .map((r) => r.rackId)}
                        canRemove={rackEntries.length > 1}
                        onRackChange={handleRackChange}
                        onRemoveRack={handleRemoveRack}
                        onShelfModeChange={handleShelfModeChange}
                        onShelfChange={handleShelfChange}
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
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50 ${meta.solid}`}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : meta.submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StockMovementModal;
