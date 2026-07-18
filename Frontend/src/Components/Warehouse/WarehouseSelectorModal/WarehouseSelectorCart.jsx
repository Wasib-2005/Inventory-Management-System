import { TbEdit, TbTrash, TbPower, TbArrowBackUp } from "react-icons/tb";
import IconActionButton from "../../Common/IconActionButton";

const WarehouseSelectorCart = ({
  w,
  selectedWarehouse,
  onSelectWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
  onChangeStatus,
  onRestoreWarehouse,
}) => {
  const isDeleted = w.isDeleted;
  const isDisabled = w.disabled;

  const isUnavailable = isDeleted || isDisabled;
  const isSelected = selectedWarehouse?._id === w._id && !isUnavailable;

  let cardStyle = "bg-white/40 border-emerald-300/40 hover:bg-white/60";
  if (isDeleted) {
    cardStyle = "bg-red-50/50 border-red-200 opacity-60";
  } else if (isDisabled) {
    cardStyle = "bg-slate-100/60 border-slate-300 opacity-75";
  } else if (isSelected) {
    cardStyle = "bg-emerald-200/60 border-emerald-400/70";
  }

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${cardStyle}`}
    >
      <button
        onClick={() => !isUnavailable && onSelectWarehouse(w)}
        className={`flex-1 text-left ${
          isUnavailable ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        disabled={isUnavailable}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-l font-bold ${
                isUnavailable ? "text-slate-600" : "text-emerald-900"
              }`}
            >
              {w.warehouseName} · {w.place}
            </span>

            {isDeleted && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded border border-red-200">
                Deleted
              </span>
            )}
            {isDisabled && !isDeleted && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded border border-slate-300">
                Disabled
              </span>
            )}
          </div>
          <span className={`text-sm ${isUnavailable ? "text-slate-500" : ""}`}>
            {w.address}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] font-bold ${
            isUnavailable ? "text-slate-400" : "text-emerald-700/50"
          }`}
        >
          {w.warehouseId}
        </span>

        {!isDeleted && (
          <IconActionButton
            icon={TbPower}
            label={isDisabled ? "Enable" : "Disable"}
            iconSize={13}
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(w._id, !w.disabled);
            }}
            className={`p-1.5 rounded-md border transition-colors ${
              isDisabled
                ? "bg-emerald-200/70 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/50"
                : " hover:bg-slate-200 text-red-700 bg-red-200 border-slate-300/50"
            }`}
          />
        )}

        {!isDeleted && (
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
        )}

        <IconActionButton
          icon={isDeleted ? TbArrowBackUp : TbTrash}
          label={isDeleted ? "Restore" : "Delete"}
          iconSize={13}
          onClick={(e) => {
            e.stopPropagation();
            if (isDeleted) {
              onRestoreWarehouse(w._id);
            } else {
              onDeleteWarehouse(w._id);
            }
          }}
          className={`p-1.5 rounded-md border transition-colors ${
            isDeleted
              ? "bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 border-blue-200/50"
              : "bg-red-50/70 hover:bg-red-100/80 text-red-700 border-red-200/50"
          }`}
        />
      </div>
    </div>
  );
};

export default WarehouseSelectorCart;
