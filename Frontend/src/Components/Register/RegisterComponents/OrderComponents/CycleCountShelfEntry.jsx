import { useState } from "react";
import { FiTrash2, FiLayers, FiPlus } from "react-icons/fi";
import ProductSearchPanel from "./ProductSearchPanel";
import MovementItemsList from "./MovementItemsList";

const CycleCountShelfEntry = ({
  entry,
  index,
  availableShelves,
  onShelfChange,
  onCustomShelfCodeChange,
  onModeChange,
  onRemoveEntry,
  onSelectProduct,
  onUpdateItem,
  onRemoveItem,
}) => {
  const selectableShelves = availableShelves.filter(
    (s) => s._id === entry.shelfId || !entry.excludedShelfIds.includes(s._id),
  );

  const isCustom = entry.mode === "custom";
  const hasShelfPicked = isCustom ? entry.customShelfCode.trim().length > 0 : !!entry.shelfId;

  return (
    <div className="rounded-xl border border-purple-300/40 bg-purple-50/30 p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <div className="flex p-0.5 rounded-md bg-purple-900/5 border border-purple-300/30 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onModeChange(entry.id, "existing")}
            className={`text-[9px] font-bold uppercase px-2 py-1 rounded transition-colors ${
              !isCustom ? "bg-white text-purple-700 shadow-sm" : "text-purple-700/50 hover:text-purple-700"
            }`}
          >
            Existing
          </button>
          <button
            type="button"
            onClick={() => onModeChange(entry.id, "custom")}
            className={`flex items-center gap-0.5 text-[9px] font-bold uppercase px-2 py-1 rounded transition-colors ${
              isCustom ? "bg-white text-purple-700 shadow-sm" : "text-purple-700/50 hover:text-purple-700"
            }`}
          >
            <FiPlus size={9} /> New
          </button>
        </div>

        <div className="relative flex-1 min-w-0">
          {isCustom ? (
            <input
              type="text"
              value={entry.customShelfCode}
              onChange={(e) => onCustomShelfCodeChange(entry.id, e.target.value)}
              placeholder="Type new shelf code..."
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-purple-300/60 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            />
          ) : (
            <>
              <FiLayers
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-700/50"
              />
              <select
                value={entry.shelfId || ""}
                onChange={(e) => onShelfChange(entry.id, e.target.value)}
                className="w-full text-xs font-semibold pl-7 pr-2 py-1.5 rounded-lg border border-purple-300/60 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400/40 appearance-none"
              >
                <option value="">Select shelf code...</option>
                {selectableShelves.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.shelfCode} ({s.productData?.length || 0} product
                    {s.productData?.length === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemoveEntry(entry.id)}
          className="p-1.5 text-purple-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
          title="Remove shelf"
        >
          <FiTrash2 size={13} />
        </button>
      </div>

      {isCustom && (
        <p className="text-[10px] text-purple-700/50 -mt-1.5 ml-7">
          This shelf doesn't exist in the warehouse yet — it'll be created with this count.
        </p>
      )}

      {!hasShelfPicked ? (
        <p className="text-[11px] text-purple-700/50 italic text-center py-2">
          {isCustom ? "Type a shelf code to start counting its products" : "Pick a shelf code to start counting its products"}
        </p>
      ) : (
        <>
          <ProductSearchPanel onSelectProduct={(product) => onSelectProduct(entry.id, product)} />
          <MovementItemsList
            type="count"
            items={entry.items}
            onUpdateItem={(cartId, patch) => onUpdateItem(entry.id, cartId, patch)}
            onRemoveItem={(cartId) => onRemoveItem(entry.id, cartId)}
          />
        </>
      )}
    </div>
  );
};

export default CycleCountShelfEntry;