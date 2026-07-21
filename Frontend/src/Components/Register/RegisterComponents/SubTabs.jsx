export const SUB_FOLDERS = {
  "products-sell": [
    { id: "sell", label: "Sell" },
    { id: "returns", label: "Returns & Warranty" },
  ],
  "credit-debt": [
    { id: "all", label: "All" },
    { id: "credit", label: "Credit" },
    { id: "debt", label: "Debt" },
  ],
  catalog: [
    { id: "category", label: "Category" },
    { id: "supplier", label: "Supplier" },
    { id: "warehouse", label: "Warehouse" },
  ],
  task: [
    { id: "emergency", label: "Emergency" },
    { id: "regular", label: "Regular" },
  ],
};

const SubTabs = ({ folder, activeSub, onSelect }) => {
  const subs = SUB_FOLDERS[folder] || [];
  if (subs.length <= 1) return null;

  return (
    <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1 overflow-x-auto">
      {subs.map((sub) => (
        <button
          key={sub.id}
          type="button"
          onClick={() => onSelect(sub.id)}
          className={`flex-1 whitespace-nowrap text-xs font-bold uppercase tracking-wide py-1.5 px-3 rounded-md transition-colors ${
            activeSub === sub.id
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-emerald-700/50 hover:text-emerald-700"
          }`}
        >
          {sub.label}
        </button>
      ))}
    </div>
  );
};

export default SubTabs;