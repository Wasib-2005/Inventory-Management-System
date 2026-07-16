import { TbColumns, TbTag } from "react-icons/tb";

// groupBy: "column" | "group"
const WarehouseGroupToggle = ({ groupBy, onChange }) => {
  const options = [
    { key: "column", label: "Column", icon: TbColumns },
    { key: "group", label: "Group", icon: TbTag },
  ];

  return (
    <div className="inline-flex rounded-lg border border-emerald-300/50 bg-white/50 p-0.5 text-[11px] font-bold shrink-0">
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${
            groupBy === key
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-800/60 hover:bg-emerald-100/60"
          }`}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default WarehouseGroupToggle;
