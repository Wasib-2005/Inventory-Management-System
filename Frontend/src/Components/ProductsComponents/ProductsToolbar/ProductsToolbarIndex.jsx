import { useEffect, useState } from "react";
import { commonInputField } from "../../../Theme/commonInputField";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import useDebounce from "../../../Hooks/useDebounce";

const sortOptions = [
  "Recently Added",
  "Name (A-Z)",
  "Stock (Low to High)",
  "Stock (High to Low)",
];

const stockStatusOptions = ["In Stock", "Low Stock", "Out of Stock"];

const ProductsToolbarIndex = ({
  openCreateProductModel,
  warehouses = [],
  categories = [],
  onQueryChange,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [filters, setFilters] = useState({
    category: "",
    stockStatus: "",
    variant: "",
  });

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    onQueryChange?.({ warehouseId, search: debouncedSearch, sortBy, filters });
    // TODO: once /api/products/:warehouseId exists, a warehouseId change
    // here is what should trigger the actual fetch (this effect already
    // isolates that dependency, so swapping mock filtering for a real
    // request later is a small change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId, debouncedSearch, sortBy, filters]);

  const clearFilters = () => {
    setFilters({ category: "", stockStatus: "", variant: "" });
  };

  const noWarehouseSelected = !warehouseId;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center">
          {/* Warehouse selector - gates everything else */}
          <div className="relative shrink-0 order-1 w-full sm:w-auto">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className={`h-10 w-full sm:w-auto pl-3 pr-8 rounded-md text-[12px] font-medium border appearance-none cursor-pointer focus:outline-none transition-colors ${
                noWarehouseSelected
                  ? "bg-amber-500/10 text-amber-400 border-amber-600/40"
                  : "bg-transparent text-emerald-300 border-emerald-700/40 hover:bg-emerald-900/20"
              }`}
            >
              <option value="" className="bg-[#0B2B22] text-amber-300">
                Select warehouse
              </option>
              {warehouses.map((w) => (
                <option
                  key={w.warehouseId}
                  value={w.warehouseId}
                  className="bg-[#0B2B22] text-emerald-300"
                >
                  {w.warehouseName}
                </option>
              ))}
            </select>
            <FiChevronDown
              size={12}
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                noWarehouseSelected ? "text-amber-400" : "text-emerald-400"
              }`}
            />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-35 order-2">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={noWarehouseSelected}
              placeholder={
                noWarehouseSelected
                  ? "Select a warehouse first..."
                  : "Search products..."
              }
              className={`${commonInputField} pl-10 w-full disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Filter toggle - icon only on mobile */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            disabled={noWarehouseSelected}
            className={`flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-md text-[12px] font-medium border transition-colors shrink-0 order-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              filterOpen
                ? "bg-[#1D9E75] text-white border-[#0F6E56]"
                : "bg-transparent text-emerald-300 border-emerald-700/40 hover:bg-emerald-900/20"
            }`}
          >
            <FiFilter size={14} />
            <span className="hidden sm:inline whitespace-nowrap">Filter</span>
          </button>

          {/* Sort */}
          <div className="relative shrink-0 order-5 sm:order-4 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={noWarehouseSelected}
              className="h-10 w-full sm:w-auto pl-3 pr-8 rounded-md bg-transparent text-emerald-400 text-[12px] font-medium border border-emerald-700/40 hover:bg-emerald-900/20 transition-colors appearance-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sortOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="bg-[#0B2B22] text-emerald-300"
                >
                  {opt}
                </option>
              ))}
            </select>
            <FiChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
            />
          </div>

          {/* Create */}
          <button
            onClick={openCreateProductModel}
            className="flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-md bg-[#1D9E75] text-white text-[12px] font-medium border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors shrink-0 whitespace-nowrap order-4 sm:order-5"
          >
            <IoIosAddCircleOutline size={16} />
            <span className="hidden sm:inline">Create Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && !noWarehouseSelected && (
          <div className="flex flex-wrap gap-2 sm:gap-3 p-3 rounded-md border border-emerald-800/40 bg-emerald-950/20">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
              className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none"
            >
              <option value="" className="bg-[#0B2B22]">
                Category
              </option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0B2B22]">
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filters.stockStatus}
              onChange={(e) =>
                setFilters((f) => ({ ...f, stockStatus: e.target.value }))
              }
              className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none"
            >
              <option value="" className="bg-[#0B2B22]">
                Stock Status
              </option>
              {stockStatusOptions.map((s) => (
                <option key={s} value={s} className="bg-[#0B2B22]">
                  {s}
                </option>
              ))}
            </select>
            <select
              value={filters.variant}
              onChange={(e) =>
                setFilters((f) => ({ ...f, variant: e.target.value }))
              }
              className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none"
            >
              <option value="" className="bg-[#0B2B22]">
                Variant
              </option>
              <option value="base" className="bg-[#0B2B22]">
                Base
              </option>
              <option value="variant" className="bg-[#0B2B22]">
                Variant
              </option>
            </select>
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto sm:ml-auto text-[12px] text-emerald-400 hover:text-emerald-200 transition-colors text-center sm:text-left"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsToolbarIndex;