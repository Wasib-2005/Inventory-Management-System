import { useState } from "react";
import { commonInputField } from "../../../Theme/commonInputField";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";

const ProductsToolbarIndex = ({  openCreateProductModel }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Recently Added");

  const sortOptions = [
    "Recently Added",
    "Name (A-Z)",
    "Stock (Low to High)",
    "Stock (High to Low)",
  ];
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Row 1 on mobile: search + create. Row on desktop: everything */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px] order-1">
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
              placeholder="Search products..."
              className={`${commonInputField} pl-10 w-full`}
            />
          </div>

          {/* Filter toggle - icon only on mobile */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-md text-[12px] font-medium border transition-colors shrink-0 order-2 ${
              filterOpen
                ? "bg-[#1D9E75] text-white border-[#0F6E56]"
                : "bg-transparent text-emerald-300 border-emerald-700/40 hover:bg-emerald-900/20"
            }`}
          >
            <FiFilter size={14} />
            <span className="hidden sm:inline whitespace-nowrap">Filter</span>
          </button>

          {/* Sort / Set By - hidden on xs, shown from sm up; full width row on mobile via order */}
          <div className="relative shrink-0 order-4 sm:order-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 w-full sm:w-auto pl-3 pr-8 rounded-md bg-transparent text-emerald-400 text-[12px] font-medium border border-emerald-700/40 hover:bg-emerald-900/20 transition-colors appearance-none cursor-pointer focus:outline-none"
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
            className="flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-md bg-[#1D9E75] text-white text-[12px] font-medium border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors shrink-0 whitespace-nowrap order-3 sm:order-4"
          >
            <IoIosAddCircleOutline size={16} />
            <span className="hidden sm:inline">Create Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="flex flex-wrap gap-2 sm:gap-3 p-3 rounded-md border border-emerald-800/40 bg-emerald-950/20">
            <select className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none">
              <option className="bg-[#0B2B22]">Category</option>
            </select>
            <select className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none">
              <option className="bg-[#0B2B22]">Stock Status</option>
            </select>
            <select className="h-9 px-3 rounded-md bg-transparent text-emerald-200 text-[12px] border border-emerald-700/40 focus:outline-none flex-1 min-w-[120px] sm:flex-none">
              <option className="bg-[#0B2B22]">Variant</option>
            </select>
            <button
              onClick={() => setFilterOpen(false)}
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
