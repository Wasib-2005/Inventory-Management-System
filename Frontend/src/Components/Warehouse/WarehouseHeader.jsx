import {
  Warehouse as WarehouseIcon,
  Search,
  ChevronRight,
  Plus,
} from "lucide-react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";
import { secondaryButton } from "../../Theme/secondaryButton";

const WarehouseHeader = ({
  selectedWarehouse,
  onOpenModal,
  handleCreateWarehouse,
}) => {
  return (
    <div
      className={`${commonComponentBG()} p-4 flex flex-row items-center justify-between`}
    >
      {/* Current Warehouse Info & Switch Trigger */}
      <button onClick={onOpenModal} className="flex items-center gap-3 group">
        <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300/50">
          <WarehouseIcon size={20} color={PALETTE.steel} />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">
            Current Warehouse
          </span>
          <span className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
            {selectedWarehouse?.place || "Select a Warehouse"}
            {selectedWarehouse?.warehouseId && (
              <span className="text-emerald-700/50 font-semibold">
                · {selectedWarehouse.warehouseId}
              </span>
            )}
            <ChevronRight
              size={14}
              className="text-emerald-700/40 group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </div>
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Create Button: Solid Emerald Contrast */}
        <button
          onClick={handleCreateWarehouse}
          className={`${secondaryButton} w-auto! px-4 bg-emerald-600! text-white! hover:bg-emerald-700! border-emerald-600! shadow-sm`}
        >
          <Plus size={13} />
          Create
        </button>

        {/* Switch Button: Soft Light Emerald Hue */}
        <button
          onClick={onOpenModal}
          className={`${secondaryButton} w-auto! px-4 bg-emerald-50/60! hover:bg-emerald-100/80! text-emerald-900! border-emerald-200!`}
        >
          <Search size={13} className="text-emerald-700" />
          Switch
        </button>
      </div>
    </div>
  );
};

export default WarehouseHeader;
