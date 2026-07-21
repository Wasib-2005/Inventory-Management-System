import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiBox, FiLayers, FiAlertTriangle, FiZap } from "react-icons/fi";

// Shown when a product's shelveData has more than one entry — forces the
// user to pick which physical shelf this order line is pulled from, so the
// cart's stock number reflects that shelf, not the product's total stock.
const ProductLocationPicker = ({ product, onConfirm, onCancel }) => {
  const shelves = product.shelveData || [];
  // Unique racks keyed by rackId (the real id — used as the select's value)
  // paired with rackCode (the human-readable code — shown as the label).
  const racks = [...new Map(shelves.map((s) => [s.rackId, s.rackCode])).entries()];

  // Default pick: the shelf with the lowest stock, so selling naturally
  // drains near-empty shelves first instead of leaving small leftover
  // quantities scattered around the warehouse.
  const lowestStockShelf = [...shelves].sort(
    (a, b) => (Number(a.stock?.inStock) || 0) - (Number(b.stock?.inStock) || 0),
  )[0];

  const [rack, setRack] = useState(lowestStockShelf?.rackId || racks[0]?.[0] || "");
  const shelvesInRack = shelves.filter((s) => s.rackId === rack);
  const [shelfId, setShelfId] = useState(
    lowestStockShelf?.shelfId || shelvesInRack[0]?.shelfId || "",
  );

  const handleRackChange = (r) => {
    setRack(r);
    const first = shelves.find((s) => s.rackId === r);
    setShelfId(first?.shelfId || "");
  };

  const handleAutoSelectLowest = () => {
    if (!lowestStockShelf) return;
    setRack(lowestStockShelf.rackId);
    setShelfId(lowestStockShelf.shelfId);
  };

  const selectedShelf = shelves.find((s) => s.shelfId === shelfId);
  const selectedStock = Number(selectedShelf?.stock?.inStock) || 0;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-emerald-900 text-sm">Pick a location</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        <p className="text-[11px] text-emerald-700/50 -mt-2">
          "{product.name}" is stocked on multiple shelves — pick which one this order pulls from.
        </p>

        <button
          type="button"
          onClick={handleAutoSelectLowest}
          className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          <FiZap size={12} />
          Auto-select lowest stock shelf
        </button>

        <div>
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Rack
          </label>
          <div className="relative">
            <FiBox size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
            <select
              value={rack}
              onChange={(e) => handleRackChange(e.target.value)}
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
            >
              {racks.map(([id, code]) => (
                <option key={id} value={id}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
            Shelf
          </label>
          <div className="relative">
            <FiLayers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
            <select
              value={shelfId}
              onChange={(e) => setShelfId(e.target.value)}
              className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
            >
              {shelvesInRack.map((s) => (
                <option key={s.shelfId} value={s.shelfId}>
                  {s.shelfCode} — {Number(s.stock?.inStock) || 0} in stock
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedShelf && selectedStock === 0 && (
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
            <FiAlertTriangle size={12} className="shrink-0" />
            This shelf shows no stock — double check before confirming.
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedShelf && onConfirm(selectedShelf)}
            disabled={!selectedShelf}
            className="flex-1 py-2 rounded-lg font-semibold text-sm text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProductLocationPicker;