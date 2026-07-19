import { FiBox } from "react-icons/fi";

const RackSelect = ({ racks = [], value, onChange, disabled }) => (
  <div>
    <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
      Rack
    </label>
    <div className="relative">
      <FiBox size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || racks.length === 0}
        className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50 appearance-none"
      >
        <option value="">{racks.length === 0 ? "No racks available" : "Select a rack"}</option>
        {racks.map((r) => (
          <option key={r._id} value={r._id}>
            {r.rackCode}
            {r.group?.groupName ? ` · ${r.group.groupName}` : ""}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default RackSelect;