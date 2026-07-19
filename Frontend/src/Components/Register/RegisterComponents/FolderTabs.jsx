import { FiShoppingCart, FiCreditCard, FiGrid, FiClock } from "react-icons/fi";

export const FOLDERS = [
  { id: "products-sell", label: "Products & Sell", icon: FiShoppingCart, activeColor: "text-blue-600" },
  { id: "credit-debt", label: "Credit & Debt", icon: FiCreditCard, activeColor: "text-rose-600" },
  { id: "catalog", label: "Catalog", icon: FiGrid, activeColor: "text-emerald-600" },
  { id: "task", label: "Task", icon: FiClock, activeColor: "text-purple-600" },
];

const FolderTabs = ({ activeFolder, onSelect }) => (
  <div className="flex items-end pl-1.5 -space-x-1 z-10 overflow-x-auto whitespace-nowrap">
    {FOLDERS.map((folder) => {
      const isActive = activeFolder === folder.id;
      const Icon = folder.icon;
      return (
        <button
          key={folder.id}
          type="button"
          onClick={() => onSelect(folder.id)}
          className={`relative flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-lg border-t border-x transition-all duration-150 shrink-0 ${
            isActive
              ? `bg-white ${folder.activeColor} border-emerald-300/40 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-9`
              : "bg-emerald-900/5 text-emerald-700/50 border-transparent hover:bg-emerald-900/10 h-8 hover:text-emerald-900/70"
          }`}
        >
          <Icon size={12} />
          {folder.label}
        </button>
      );
    })}
  </div>
);

export default FolderTabs;