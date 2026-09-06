import {
  TbBuildingWarehouse,
  TbPlus,
  TbEdit,
  TbChevronRight,
} from "react-icons/tb";
import { HiSwitchHorizontal } from "react-icons/hi";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";
import IconActionButton from "../Common/IconActionButton";

// selectedWarehouse follows the real /warehouses/get(/:id) shape:
// { _id, warehouseId, warehouseName, place, address, ... }
const WarehouseHeader = ({
  selectedWarehouse,
  onOpenSwitchModal,
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  return (
    <div
      className={`${commonComponentBG()} p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
    >
      {/* Current Warehouse Info Button */}
      <button
        onClick={onOpenSwitchModal}
        className="flex items-start sm:items-center gap-3 group text-left w-full sm:w-auto min-w-0"
      >
        <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300/50 shrink-0 mt-0.5 sm:mt-0">
          <TbBuildingWarehouse size={20} color={PALETTE.steel} />
        </div>
        
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">
            Current Warehouse
          </span>
          
          <span className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 flex-wrap w-full">
            <span className="truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
              {selectedWarehouse?.warehouseName || "Select a Warehouse"}
            </span>
            {selectedWarehouse?.warehouseId && (
              <span className="text-emerald-700/50 font-semibold shrink-0">
                · {selectedWarehouse.warehouseId}
              </span>
            )}
            <TbChevronRight
              size={14}
              className="text-emerald-700/40 group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </span>

          {selectedWarehouse?.address && (
            <p className="text-xs sm:text-sm text-gray-600 truncate w-full max-w-xs sm:max-w-md">
              {selectedWarehouse.address}
            </p>
          )}
        </div>
      </button>

      {/* Actions Section */}
      <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-emerald-900/10">
        <IconActionButton
          icon={TbEdit}
          label="Edit Warehouse"
          onClick={onOpenEditModal}
          className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 border border-amber-200/60 shadow-sm transition-colors"
        />
        <IconActionButton
          icon={TbPlus}
          label="Create Warehouse"
          onClick={onOpenCreateModal}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-sm transition-colors"
        />
        <IconActionButton
          icon={HiSwitchHorizontal}
          label="Switch Warehouse"
          onClick={onOpenSwitchModal}
          className="p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 shadow-sm transition-colors"
        />
      </div>
    </div>
  );
};

export default WarehouseHeader;