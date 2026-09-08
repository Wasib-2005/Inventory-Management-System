import { useEffect, useRef, useState } from "react";
import { FiTruck, FiSearch, FiX } from "react-icons/fi";
import { searchSuppliers } from "./api";

const SupplierSearchField = ({
  label = "Supplier",
  value,
  onChange,
  placeholder = "Search supplier by name...",
}) => {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || "");
  }, [value]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    const timer = setTimeout(() => {
      searchSuppliers(query.trim(), controller.signal)
        .then((res) => setResults(res.data?.data || []))
        .catch((err) => {
          if (err.name !== "CanceledError") setResults([]);
        })
        .finally(() => setIsLoading(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (supplier) => {
    onChange({
      _id: supplier._id,
      name: supplier.suppliersName,
      supplierCode: supplier.supplierCode,
      phone: supplier.contact?.phone || "",
    });
    setQuery(supplier.suppliersName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <FiTruck
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-700/40"
          size={14}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full text-sm pl-8 pr-7 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700/40 hover:text-rose-600"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-emerald-300/40 rounded-lg shadow-lg">
          {isLoading ? (
            <p className="text-[12px] text-emerald-700/40 italic px-3 py-2">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="text-[12px] text-emerald-700/40 italic px-3 py-2">
              No suppliers found
            </p>
          ) : (
            results.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[12px] hover:bg-emerald-50"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FiSearch className="text-emerald-700/30 shrink-0" size={12} />
                  <span className="font-semibold text-emerald-900 truncate">
                    {s.suppliersName}
                  </span>
                </span>
                <span className="text-emerald-700/40 shrink-0">{s.supplierCode}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierSearchField;