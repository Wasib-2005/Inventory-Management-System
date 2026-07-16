import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  searchSuppliers,
  deleteSupplier,
} from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import SupplierAddModal from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/SupplierAddModal";

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-500 border-slate-200",
  Blacklisted: "bg-rose-50 text-rose-600 border-rose-200",
};

const SupplierManager = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    searchSuppliers("", controller.signal)
      .then((res) => setSuppliers(res.data?.data || []))
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(err.response?.data?.message || "Could not load suppliers");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const handleDelete = async (supplier) => {
    if (
      !window.confirm(
        `Delete supplier "${supplier.suppliersName}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(supplier._id);
    setError("");
    try {
      await deleteSupplier(supplier._id);
      setSuppliers((prev) => prev.filter((s) => s._id !== supplier._id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete supplier");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
          Suppliers {!isLoading && `(${suppliers.length})`}
        </h4>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
        >
          <FiPlus size={12} /> Add Supplier
        </button>
      </div>

      {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[12px] text-emerald-700/40 italic">Loading...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">
            No suppliers yet
          </p>
        ) : (
          suppliers.map((sup) => (
            <div
              key={sup._id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-emerald-900 truncate">
                  {sup.suppliersName}
                  <span className="text-emerald-700/50 font-medium">
                    {" "}
                    · {sup.supplierCode}
                  </span>
                </p>
                <p className="text-[10px] text-emerald-700/50 truncate">
                  {[sup.address?.city, sup.address?.country]
                    .filter(Boolean)
                    .join(", ") || "No address on file"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                    STATUS_STYLES[sup.status] || STATUS_STYLES.Active
                  }`}
                >
                  {sup.status}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(sup)}
                  disabled={deletingId === sup._id}
                  className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                  title="Delete supplier"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddOpen && (
        <SupplierAddModal
          onClose={() => setIsAddOpen(false)}
          onCreated={(created) => setSuppliers((prev) => [...prev, created])}
        />
      )}
    </div>
  );
};

export default SupplierManager;
