import { TbPlus } from "react-icons/tb";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import WarehouseGroupToggle from "./WarehouseGroupToggle";
import WarehouseRackSection from "./WarehouseRackSection";
import { computeRackStats, groupRacks } from "../utils";

// racks: flat array from warehouse.rackdata (already populated with shelfData/productData)
const WarehouseRackContainer = ({
  racks,
  groupBy,
  onGroupByChange,
  onSelectRack,
  highlightedRackCode,
  onAddRack,
}) => {
  // racks can legitimately be undefined/null for a moment (no warehouse
  // selected yet, or the detail fetch hasn't resolved) - never assume it's
  // an array.
  const safeRacks = Array.isArray(racks) ? racks : [];

  const totalItems = safeRacks.reduce(
    (sum, r) => sum + computeRackStats(r).itemCount,
    0,
  );
  const sections = groupRacks(safeRacks, groupBy);

  return (
    <div className={`${commonComponentBG()} p-4 sm:p-6 flex flex-col gap-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">
          Rack System
        </h2>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-semibold text-emerald-700/50">
            {totalItems} items stored
          </span>
          <WarehouseGroupToggle groupBy={groupBy} onChange={onGroupByChange} />
          <button
            onClick={onAddRack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <TbPlus size={14} />
            Add Rack
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-1/3 px-1 flex justify-between rounded-full bg-linear-to-r from-[#FF0000] via-[#FFFF00] to-[#50C878] text-sm">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {safeRacks.length === 0 ? (
        <p className="text-xs text-emerald-700/40 font-semibold py-6 text-center">
          No racks yet — add one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <WarehouseRackSection
              key={section.key}
              title={section.key}
              colour={section.colour}
              racks={section.racks}
              onSelectRack={onSelectRack}
              highlightedRackCode={highlightedRackCode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehouseRackContainer;
