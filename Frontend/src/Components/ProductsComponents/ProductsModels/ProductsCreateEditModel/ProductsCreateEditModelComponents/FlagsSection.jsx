const FLAGS = [
  { key: "isSellable", label: "Sellable" },
  { key: "isPurchasable", label: "Purchasable" },
  { key: "isBatchTracked", label: "Batch Tracked" },
];

const FlagsSection = ({ flags, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-white border border-emerald-200">
      {FLAGS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            checked={flags[key]}
            onChange={(e) => onChange(key, e.target.checked)}
            className="w-4 h-4 accent-emerald-600"
          />
          <span className="text-xs text-emerald-800 font-medium">{label}</span>
        </label>
      ))}
    </div>
  );
};

export default FlagsSection;
