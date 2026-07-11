import { FiPlus, FiX } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";

const ChipListField = ({
  label,
  items,
  input,
  setInput,
  onAdd,
  onRemove,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-2 py-1 rounded-full"
          >
            {item}
            <button type="button" onClick={() => onRemove(item)}>
              <FiX size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={`Add ${label.replace(" *", "").toLowerCase()}...`}
          className={`${commonInputField} flex-1`}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
        >
          <FiPlus size={14} />
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

export default ChipListField;
