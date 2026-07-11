import { FiPlus, FiTrash2 } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";

const SpecificationsSection = ({
  specifications,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-white border border-emerald-200 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-emerald-800 font-semibold uppercase text-xs tracking-wider">
          Specifications
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
        >
          <FiPlus size={12} /> Add Spec
        </button>
      </div>
      {specifications.map((spec, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Key (e.g. Color)"
            value={spec.key}
            onChange={(e) => onUpdate(index, "key", e.target.value)}
            className={commonInputField}
          />
          <input
            type="text"
            placeholder="Value (e.g. Midnight Blue)"
            value={spec.value}
            onChange={(e) => onUpdate(index, "value", e.target.value)}
            className={commonInputField}
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SpecificationsSection;
