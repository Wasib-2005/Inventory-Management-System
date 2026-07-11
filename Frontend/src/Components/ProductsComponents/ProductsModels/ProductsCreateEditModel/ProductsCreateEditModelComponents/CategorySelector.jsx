import { useEffect, useRef, useState } from "react";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { useEntitySearch } from "./useEntitySearch";
import { useClickOutside } from "./useClickOutside";
import { searchCategories } from "./api";

// value shape: { _id, category, subcategory } | null
const CategorySelector = ({ value, onChange, onOpenAddModal, error }) => {
  const containerRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  const { query, setQuery, results, isLoading } = useEntitySearch(
    searchCategories,
    { skip: !!value },
  );

  useClickOutside(containerRef, () => setShowSuggestions(false));

  // When editing an existing product we only have {_id, category, subcategory}
  // persisted — re-fetch by name once so the subcategory <select> has options.
  useEffect(() => {
    if (!value?._id || subCategoryOptions.length > 0) return;
    const controller = new AbortController();
    searchCategories(value.category, controller.signal)
      .then((res) => {
        const match = (res.data?.data || []).find((c) => c._id === value._id);
        if (match) setSubCategoryOptions(match.subCategories || []);
      })
      .catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?._id]);

  const handleSelect = (suggestion) => {
    onChange({ _id: suggestion._id, category: suggestion.category, subcategory: "" });
    setSubCategoryOptions(suggestion.subCategories || []);
    setQuery("");
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange(null);
    setSubCategoryOptions([]);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
        Category *
      </label>

      {value ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1.5 rounded-md w-fit shrink-0">
            {value.category}
            <button type="button" onClick={handleClear}>
              <FiX size={12} />
            </button>
          </span>

          <select
            value={value.subcategory || ""}
            onChange={(e) => onChange({ ...value, subcategory: e.target.value })}
            disabled={subCategoryOptions.length === 0}
            className={`${commonInputField} cursor-pointer flex-1`}
          >
            <option value="">
              {subCategoryOptions.length ? "Select subcategory" : "No subcategories"}
            </option>
            {subCategoryOptions.map((sub) => (
              <option key={sub._id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search category..."
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
                results.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    onClick={() => handleSelect(suggestion)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <span>{suggestion.category}</span>
                    {suggestion.subCategories?.length > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                        {suggestion.subCategories.length} subs
                      </span>
                    )}
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
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

export default CategorySelector;
