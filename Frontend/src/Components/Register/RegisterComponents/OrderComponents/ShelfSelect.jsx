import { FiLayers } from "react-icons/fi";

const ShelfSelect = ({ shelves = [], value, onChange, disabled }) => (
  <div>
    <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
      Shelf
    </label>
    <div className="relative">
      <FiLayers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || shelves.length === 0}
        className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50 appearance-none"
      >
        <option value="">{shelves.length === 0 ? "No shelves on this rack" : "Select a shelf"}</option>
        {shelves.map((s) => (
          <option key={s._id} value={s._id}>
            {s.shelfCode} ({s.productData?.length || 0} product{s.productData?.length === 1 ? "" : "s"})
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default ShelfSelect;