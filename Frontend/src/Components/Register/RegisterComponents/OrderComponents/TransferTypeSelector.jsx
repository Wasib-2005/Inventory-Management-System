const TransferTypeSelector = ({ label = "Type", options, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
      {label}
    </label>
    <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex-1 text-[11px] font-bold uppercase tracking-wide py-1.5 rounded-md transition-colors ${
            value === opt.id
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-emerald-700/50 hover:text-emerald-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default TransferTypeSelector;