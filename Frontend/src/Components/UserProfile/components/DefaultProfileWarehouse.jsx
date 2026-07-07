import { TbBuildingWarehouse, TbChevronRight } from "react-icons/tb";
import { HiSwitchHorizontal } from "react-icons/hi";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import IconActionButton from "../../Common/IconActionButton";

const DefaultProfileWarehouse = ({ selectedWarehouse, onOpenSwitchModal }) => {
  return (
    <div
      className={`${commonComponentBG()} p-4 flex flex-row items-center justify-between`}
    >
      <button
        onClick={onOpenSwitchModal}
        className="flex items-center gap-3 group"
      >
        <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300/50">
          <TbBuildingWarehouse size={20} color={PALETTE.steel} />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">
            Current Warehouse
          </span>
          <span className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
            {selectedWarehouse?.warehouseName || "Select a Warehouse"}
            {selectedWarehouse?.id && (
              <span className="text-emerald-700/50 font-semibold">
                · {selectedWarehouse?.id}
              </span>
            )}
            <TbChevronRight
              size={14}
              className="text-emerald-700/40 group-hover:translate-x-0.5 transition-transform"
            />
          </span>
          <p className="text-sm">{selectedWarehouse?.address}</p>
        </div>
      </button>

      <IconActionButton
        icon={HiSwitchHorizontal}
        label="Switch Warehouse"
        onClick={onOpenSwitchModal}
        className="p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 shadow-sm transition-colors"
      />
    </div>
  );
};

export default DefaultProfileWarehouse;