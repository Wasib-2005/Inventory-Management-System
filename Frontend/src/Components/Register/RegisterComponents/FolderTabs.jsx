export const FOLDERS = [
  { id: "operations", label: "Operations", activeColor: "text-blue-600" },
  { id: "credit", label: "Credit Pay", activeColor: "text-rose-600", dot: "bg-rose-500" },
  { id: "catalog", label: "Catalog", activeColor: "text-emerald-600" },
  { id: "supply", label: "Supply", activeColor: "text-purple-600" },
];

const FolderTabs = ({ activeFolder, onSelect }) => (
  <div className="flex items-end pl-2 -space-x-1 z-10 overflow-x-auto whitespace-nowrap">
    {FOLDERS.map((folder) => {
      const isActive = activeFolder === folder.id;
      return (
        <button
          key={folder.id}
          type="button"
          onClick={() => onSelect(folder.id)}
          className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-t border-x transition-all duration-150 shrink-0 ${
            isActive
              ? `bg-white ${folder.activeColor} border-emerald-300/40 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] h-11`
              : "bg-emerald-900/5 text-emerald-700/50 border-transparent hover:bg-emerald-900/10 h-10 hover:text-emerald-900/70"
          }`}
        >
          {folder.dot ? (
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${folder.dot}`} />
              {folder.label}
            </span>
          ) : (
            folder.label
          )}
        </button>
      );
    })}
  </div>
);

export default FolderTabs;
