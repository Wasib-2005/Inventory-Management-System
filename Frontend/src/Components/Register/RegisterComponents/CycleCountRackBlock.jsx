import { FiTrash2 } from "react-icons/fi";
import RackSelect from "./OrderComponents/RackSelect";

const SHELF_MODES = [
  { id: "all", label: "All Shelves" },
  { id: "one", label: "Selected Shelves" },
];

// NOTE: assumes RackSelect accepts an `excludeIds` array prop, mirroring
// how WarehouseSelect already accepts `excludeId`. Add that prop to
// RackSelect if it isn't there yet.
const CycleCountRackBlock = ({
  index,
  rackEntry,
  racks,
  excludedRackIds,
  canRemove,
  onRackChange,
  onRemoveRack,
  onShelfModeChange,
  onShelfChange,
}) => {
  const selectedRack = racks.find((r) => r._id === rackEntry.rackId) || null;
  const rackShelves = selectedRack?.shelfData || [];

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-purple-700/70 uppercase">
          Rack {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemoveRack(rackEntry.id)}
            className="p-1 text-purple-700/40 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>

      <RackSelect
        racks={racks}
        value={rackEntry.rackId}
        onChange={(rackId) => onRackChange(rackEntry.id, rackId)}
        excludeIds={excludedRackIds}
      />

      {rackEntry.rackId && (
        <>
          <div className="flex p-1 rounded-lg bg-purple-900/5 border border-purple-300/30 gap-1">
            {SHELF_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onShelfModeChange(rackEntry.id, m.id)}
                className={`flex-1 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide py-1.5 px-2 rounded-md transition-colors ${
                  rackEntry.shelfMode === m.id
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-purple-700/50 hover:text-purple-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {rackEntry.shelfMode === "one" && (
            <div>
              <label className="block text-[10px] font-bold text-purple-700/60 uppercase mb-1">
                Shelves
              </label>
              <select
                value={rackEntry.shelfId}
                onChange={(e) => onShelfChange(rackEntry.id, e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-purple-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              >
                <option value="">Select shelves...</option>
                {rackShelves.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.shelfCode}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CycleCountRackBlock;