import { TbEdit, TbTrash } from "react-icons/tb";
import IconActionButton from "../../Common/IconActionButton";

const WarehouseSelectorCart = ({
  w,
  selectedWarehouse,
  onSelectWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
        selectedWarehouse.id === w.id
          ? "bg-emerald-200/60 border-emerald-400/70"
          : "bg-white/40 border-emerald-300/40 hover:bg-white/60"
      }`}
    >
      <button onClick={() => onSelectWarehouse(w)} className="flex-1 text-left">
        <p className="flex flex-col">
          <span className="text-l font-bold text-emerald-900">
            {w.warehouseName} · {w.place}
          </span>
          <span className="text-sm">{w.address}</span>
        </p>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-emerald-700/50">
          {w.id}
        </span>
        <IconActionButton
          icon={TbTrash}
          label={"Delete"}
          iconSize={13}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteWarehouse(w.id, w.mongoId);
          }}
          className="p-1.5 rounded-md bg-red-50/70 hover:bg-red-100/80 text-red-700 border border-red-200/50 transition-colors"
        />
        <IconActionButton
          icon={TbEdit}
          label="Edit"
          iconSize={13}
          onClick={(e) => {
            e.stopPropagation();
            onEditWarehouse(w);
          }}
          className="p-1.5 rounded-md bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 border border-amber-200/50 transition-colors"
        />
      </div>
    </div>
  );
};

export default WarehouseSelectorCart;
