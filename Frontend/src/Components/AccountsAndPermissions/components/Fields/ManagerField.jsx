import { useState, useEffect, useRef } from "react";
import { commonComponentBG } from "../../../../Theme/commonComponentBG";
import { commonInputField } from "../../../../Theme/commonInputField";
import useDebounce from "../../../../Hooks/useDebounce";
import axios from "axios";
import { ReadonlyField } from "../DetailTabs";

const FieldLabel = ({ children, required }) => (
  <div className="text-[11px] text-(--color-text-tertiary) mb-1">
    {children}
    {required && <span className="text-[#A32D2D] ml-0.5">*</span>}
  </div>
);

const resolveDisplayName = (manager) => {
  if (!manager) return "";
  if (typeof manager === "string") return manager;
  return manager.displayName || manager.username || manager.email || "";
};

const ManagerField = ({
  manager ,
  editing = false,
  onSelectManager, // called with manager._id when a suggestion is picked
  onChange, // called with ("manager", managerObject) when a suggestion is picked
}) => {
  const [inputValue, setInputValue] = useState(() =>
    resolveDisplayName(manager),
  );
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  console.log(manager)

  // Re-sync input when the manager prop changes (e.g. different user selected in list)
  useEffect(() => {
    setInputValue(resolveDisplayName(manager));
    setSuggestions([]);
    setIsOpen(false);
  }, [manager]);

  const debouncedSearch = useDebounce(inputValue, 500);

  useEffect(() => {
    if (!editing) return;

    const fetchManagers = async () => {
      if (!debouncedSearch?.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/get-managers?search=${debouncedSearch}`,
          { withCredentials: true },
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching managers:", error);
        setSuggestions([]);
      }
    };

    fetchManagers();
  }, [debouncedSearch, editing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // If user typed but didn't select, restore the last valid manager display name
        setInputValue(resolveDisplayName(manager));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [manager]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    if (e.target.value === "") {
      onChange("manager", {});
      onSelectManager("");
    }
  };

  const handleSelect = (selected) => {
    setInputValue(selected.displayName || selected.username || "");
    setSuggestions([]);
    setIsOpen(false);
    // Only fire onChange when a real manager object is confirmed
    if (onChange) onChange("manager", selected);
    if (onSelectManager) onSelectManager(selected._id);
  };

  if (!editing) {
    return (
      <ReadonlyField label="Manager" value={resolveDisplayName(manager)} />
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <FieldLabel>Manager</FieldLabel>
      <input
        type="text"
        name="manager"
        value={inputValue}
        className={commonInputField}
        onChange={handleInputChange}
        onFocus={() => inputValue?.trim() && setIsOpen(true)}
        placeholder="Type to search managers..."
        autoComplete="off"
      />

      {isOpen && inputValue?.trim() !== "" && (
        <div
          className={`${commonComponentBG()} mt-1 z-50 p-2 absolute left-0 right-0 max-h-52 overflow-y-auto rounded-md shadow-lg border border-(--color-border-secondary)`}
        >
          {suggestions.length > 0 ? (
            <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
              {suggestions.map((m) => (
                <li key={m._id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // prevent outside-click from firing before select
                    onClick={() => handleSelect(m)}
                    className="w-full text-left px-3 py-2 rounded text-[12px] text-(--color-text-primary) hover:bg-[#1D9E75] hover:text-white transition-colors"
                  >
                    <span className="font-medium">{m.displayName}</span>
                    {m.username && (
                      <span className="ml-1.5 opacity-60">@{m.username}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[12px] p-2 text-(--color-text-tertiary)">
              No managers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerField;
