import { useRef, useCallback, useState, useEffect } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FiFilter, FiX, FiCheck } from "react-icons/fi";
import UserListItem from "./UserListItem";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { commonInputField } from "../../../Theme/commonInputField";

const DEFAULT_FILTERS = { status: "all", type: "all", gender: "all" };

const FILTER_OPTIONS = {
  status: [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "onboarding", label: "Onboarding" },
    { value: "on-leave", label: "On-Leave" },
    { value: "suspended", label: "Suspended" },
    { value: "terminated", label: "Terminated" },
  ],
  type: [
    { value: "all", label: "All Types" },
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "intern", label: "Intern" },
    { value: "consultant", label: "Consultant" },
    { value: "contractor", label: "Contractor" },
  ],
  gender: [
    { value: "all", label: "All Genders" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],
};

const FILTER_LABELS = { status: "Status", type: "Type", gender: "Gender" };

const UserList = ({
  users,
  selectedId,
  onSelect,
  onCreateClick,
  query,
  setQuery,
  hasMore,
  onLoadMore,
  isLoadingMore,
  filters,
  setFilters,
}) => {
  const observerRef = useRef(null);
  const panelRef = useRef(null);
  const filterBtnRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilters = { ...DEFAULT_FILTERS, ...filters };

  const sentinelCb = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore || isLoadingMore) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      });
      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, onLoadMore],
  );

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target)
      ) {
        setIsFilterOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setIsFilterOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isFilterOpen]);

  const activeEntries = Object.entries(activeFilters).filter(
    ([, v]) => v && v !== "all",
  );
  const activeCount = activeEntries.length;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, ...prev, [key]: value }));
  };

  const clearFilter = (key) => handleFilterChange(key, "all");
  const clearAllFilters = () => setFilters({ ...DEFAULT_FILTERS });

  const optionLabel = (key, value) =>
    FILTER_OPTIONS[key]?.find((o) => o.value === value)?.label || value;

  return (
    <div
      className={`flex flex-col h-full overflow-hidden bg-(--color-background-secondary) ${commonComponentBG("r")} relative`}
    >
      {/* Toolbar */}
      <div className=" flex items-center justify-between px-3.5 py-2.5 bg-(--color-background-primary) border-b border-emerald-400 shrink-0">
        <span className="text-[12px] font-medium text-(--color-text-secondary)">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[#1D9E75] text-white text-[12px] font-medium border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors"
        >
          <IoPersonAddSharp size={13} />
          Create user
        </button>
      </div>

      {/* Search + Filter trigger */}
      <div className="relative px-3 py-2.5 bg-(--color-background-primary) border-b border-emerald-400 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <CiSearch
            className="absolute left-2 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)"
            size={15}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email"
            className={` ${commonInputField} w-full h-8 pl-7 pr-2 border border-(--color-border-secondary) rounded-md bg-(--color-background-secondary) text-(--color-text-primary) text-[12px] focus:outline-none focus:border-[#1D9E75] `}
          />
        </div>

        <button
          ref={filterBtnRef}
          onClick={() => setIsFilterOpen((v) => !v)}
          aria-expanded={isFilterOpen}
          aria-haspopup="true"
          className={`relative h-8 w-8 flex items-center justify-center border rounded-md transition-colors ${
            activeCount > 0 || isFilterOpen
              ? "bg-[#1D9E75]/10 border-[#1D9E75] text-[#1D9E75]"
              : "border-emerald-400 bg-(--color-background-secondary) text-gray-700 hover:bg-(--color-background-primary)"
          }`}
          title="Filter Options"
        >
          <FiFilter size={14} />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-[#1D9E75] text-white text-[9px] font-semibold leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {/* Filter Popover */}
        {isFilterOpen && (
          <div
            ref={panelRef}
            role="dialog"
            className={` ${commonComponentBG()} absolute top-[calc(100%-2px)] right-3 z-30 w-60 bg-(--color-background-primary) border border-(--color-border-secondary) rounded-md shadow-xl p-3 flex flex-col gap-3 animate-fadeIn`}
          >
            <div className="flex items-center justify-between border-b border-(--color-border-tertiary) pb-1.5">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-(--color-text-secondary)">
                Filters
              </span>
              {activeCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#1D9E75] hover:underline flex items-center gap-0.5"
                >
                  <FiX size={12} /> Clear all
                </button>
              )}
            </div>

            {Object.keys(FILTER_OPTIONS).map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-(--color-text-tertiary)">
                  {FILTER_LABELS[key]}
                </label>
                <select
                  value={activeFilters[key]}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className={`${commonInputField} w-full h-7 px-1.5 text-[11px] border border-(--color-border-secondary) rounded bg-(--color-background-secondary) text-(--color-text-primary) focus:outline-none focus:border-[#1D9E75]`}
                >
                  {FILTER_OPTIONS[key].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full h-7 flex items-center justify-center gap-1.5 rounded text-[11px] font-medium bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors mt-1"
            >
              <FiCheck size={12} /> Done
            </button>
          </div>
        )}
      </div>

      {/* Active filter chips — lets you see + remove filters without reopening the popover */}
      {activeCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-3 py-2 bg-(--color-background-primary) border-b border-(--color-border-tertiary) shrink-0">
          {activeEntries.map(([key, value]) => (
            <span
              key={key}
              className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full bg-[#1D9E75]/10 border border-[#1D9E75]/40 text-[#1D9E75] text-[11px] font-medium"
            >
              {optionLabel(key, value)}
              <button
                onClick={() => clearFilter(key)}
                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-[#1D9E75]/20 transition-colors"
                aria-label={`Remove ${FILTER_LABELS[key]} filter`}
              >
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 && !isLoadingMore ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[13px] text-(--color-text-tertiary)">
            <span>No users found</span>
            {activeCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[12px] text-[#1D9E75] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {users.map((u) => (
              <UserListItem
                key={u._id}
                user={u}
                active={u._id === selectedId}
                onClick={() => onSelect(u._id)}
              />
            ))}

            {/* Sentinel */}
            <div ref={sentinelCb} className="h-px" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-4 gap-2 text-[12px] text-(--color-text-tertiary)">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-(--color-border-secondary) border-t-[#1D9E75] animate-spin" />
                Loading…
              </div>
            )}

            {!hasMore && users.length > 0 && (
              <div className="text-center py-3 text-[11px] text-(--color-text-tertiary) opacity-40">
                All users loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;