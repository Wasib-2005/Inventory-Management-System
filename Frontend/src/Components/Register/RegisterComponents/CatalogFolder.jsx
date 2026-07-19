import { useNavigate } from "react-router";
import { FiBox } from "react-icons/fi";
import CategoryManager from "./CategoryManager";
import SupplierManager from "./SupplierManager";
import WarehouseManager from "./WarehouseManager";

const CatalogFolder = ({ activeSub }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Catalog</h3>
          <p className="text-xs text-emerald-700/50 mt-0.5">
            Categories, suppliers, and warehouses used across your products
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <FiBox size={13} />
          Manage Products
        </button>
      </div>

      {activeSub === "category" && <CategoryManager />}
      {activeSub === "supplier" && <SupplierManager />}
      {activeSub === "warehouse" && <WarehouseManager />}
    </div>
  );
};

export default CatalogFolder;