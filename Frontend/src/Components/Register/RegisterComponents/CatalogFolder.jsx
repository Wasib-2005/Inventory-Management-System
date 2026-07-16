import { useState } from "react";
import { useNavigate } from "react-router";
import { FiBox } from "react-icons/fi";
import CategoryManager from "./CategoryManager";
import SupplierManager from "./SupplierManager";

const CatalogFolder = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("category"); // "category" | "supplier"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-emerald-900">Catalog</h3>
        <p className="text-xs text-emerald-700/50 mt-0.5">
          Manage categories and suppliers used across your products
        </p>
      </div>

      {/* Manage Products - jumps to the full Products page */}
      <button
        type="button"
        onClick={() => navigate("/products")}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors"
      >
        <FiBox size={15} />
        Manage Products
      </button>

      {/* Category / Supplier toggle */}
      <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1">
        <button
          type="button"
          onClick={() => setView("category")}
          className={`flex-1 text-xs font-bold uppercase tracking-wide py-1.5 rounded-md transition-colors ${
            view === "category"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-emerald-700/50 hover:text-emerald-700"
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setView("supplier")}
          className={`flex-1 text-xs font-bold uppercase tracking-wide py-1.5 rounded-md transition-colors ${
            view === "supplier"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-emerald-700/50 hover:text-emerald-700"
          }`}
        >
          Suppliers
        </button>
      </div>

      {view === "category" ? <CategoryManager /> : <SupplierManager />}
    </div>
  );
};

export default CatalogFolder;
