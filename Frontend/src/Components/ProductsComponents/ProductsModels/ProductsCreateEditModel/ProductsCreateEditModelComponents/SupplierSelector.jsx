import { useRef, useState } from "react";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { useEntitySearch } from "./useEntitySearch";
import { useClickOutside } from "./useClickOutside";
import { searchSuppliers } from "./api";

const SupplierSelector = ({ suppliers, onAdd, onRemove, onOpenAddModal }) => {
  const containerRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { query, setQuery, results, isLoading } =
    useEntitySearch(searchSuppliers);

  useClickOutside(containerRef, () => setShowSuggestions(false));

  const handleSelect = (supplier) => {
    onAdd(supplier);
    setQuery("");
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
        Suppliers
      </label>

      <div className="flex flex-wrap gap-1.5">
        {suppliers.map((s) => (
          <span
            key={s._id}
            className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-2 py-1 rounded-full"
          >
            <span className="font-semibold">{s.code}</span>
            <span className="text-emerald-600">· {s.suppliersName}</span>
            <button type="button" onClick={() => onRemove(s._id)}>
              <FiX size={11} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search suppliers..."
          className={`${commonInputField} flex-1`}
        />
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 shrink-0"
        >
          <FiPlus size={14} />
        </button>

        {showSuggestions && query.trim() && (
          <div className="absolute top-[100%] left-0 w-[calc(100%-2.75rem)] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                <FiLoader className="animate-spin text-emerald-600" size={16} />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((supplier) => (
                <div
                  key={supplier._id}
                  onClick={() => handleSelect(supplier)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors flex justify-between items-center"
                >
                  <span>{supplier.suppliersName}</span>
                  <span className="text-[10px] text-gray-400">
                    {supplier.code}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-center text-gray-400">
                No matches found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierSelector;
