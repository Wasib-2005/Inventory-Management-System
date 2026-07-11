import { useRef, useState } from "react";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { useEntitySearch } from "./useEntitySearch";
import { useClickOutside } from "./useClickOutside";
import { searchTags } from "./api";

const TagSelector = ({ tags, onAdd, onRemove }) => {
  const containerRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { query, setQuery, results, isLoading } = useEntitySearch(searchTags);

  useClickOutside(containerRef, () => setShowSuggestions(false));

  const commitTag = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setQuery("");
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
        Tags
      </label>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-2 py-1 rounded-full"
          >
            {tag}
            <button type="button" onClick={() => onRemove(tag)}>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTag(query);
            }
          }}
          placeholder="Add tag..."
          className={`${commonInputField} flex-1`}
        />
        <button
          type="button"
          onClick={() => commitTag(query)}
          title="Add typed tag"
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
              results.map((tag) => (
                <div
                  key={tag._id || tag.name || tag}
                  onClick={() => commitTag(tag.name || tag)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors"
                >
                  {tag.name || tag}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-center text-gray-400">
                No existing match — press + to add "{query}" as a new tag.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
