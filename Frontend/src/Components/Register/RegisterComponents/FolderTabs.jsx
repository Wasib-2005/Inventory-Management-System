import { FiShoppingCart, FiCreditCard, FiGrid, FiClock } from "react-icons/fi";

export const FOLDERS = [
  { id: "products-sell", label: "Products & Sell", icon: FiShoppingCart, activeColor: "text-blue-600" },
  { id: "credit-debt", label: "Due / Debt", icon: FiCreditCard, activeColor: "text-rose-600" },
  { id: "catalog", label: "Catalog", icon: FiGrid, activeColor: "text-emerald-600" },
  { id: "task", label: "Task", icon: FiClock, activeColor: "text-purple-600" },
];

const FolderTabs = ({ activeFolder, onSelect }) => (
  <div className="grid grid-cols-2 sm:flex items-end gap-1 z-10 overflow-x-auto pb-1 scrollbar-thin">
    {FOLDERS.map((folder) => {
      const isActive = activeFolder === folder.id;
      const Icon = folder.icon;
      return (
        <button
          key={folder.id}
          type="button"
          onClick={() => onSelect(folder.id)}
          className={`relative flex min-w-0 w-full sm:w-[160px] h-14 sm:h-10 items-center justify-center gap-1.5 px-2 sm:px-3 text-base font-bold uppercase tracking-wide text-center leading-tight rounded-lg border transition-all duration-150 ${
            isActive
              ? `bg-white ${folder.activeColor} border-emerald-300/40 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]`
              : "bg-emerald-900/5 text-emerald-700/50 border-transparent hover:bg-emerald-900/10 hover:text-emerald-900/70"
          }`}
        >
          <Icon size={17} className="shrink-0" />
          <span className="min-w-0 break-words">{folder.label}</span>
        </button>
      );
    })}
  </div>
);

export default FolderTabs;