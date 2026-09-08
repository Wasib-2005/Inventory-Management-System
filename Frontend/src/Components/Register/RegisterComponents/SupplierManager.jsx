import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiRotateCcw } from "react-icons/fi";
import Swal from "sweetalert2";
import {
  searchSuppliers,
  deleteSupplier,
  restoreSupplier,
  updateSupplier,
} from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import SupplierAddModal from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/SupplierAddModal";
import SupplierDetailModal from "./SupplierDetailModal";

const STATUS_OPTIONS = ["Active", "Inactive", "Blacklisted"];

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
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [statusError, setStatusError] = useState("");

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

  // Soft delete — confirm first, then mark it deleted in place (rather
  // than removing it from the list) so a Restore icon can bring it right
  // back without a refetch.
  const handleDelete = async (supplier) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Delete "${supplier.suppliersName}"?`,
      text: "It'll be moved to trash — you can restore it right after.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
    });
    if (!result.isConfirmed) return;

    setDeletingId(supplier._id);
    setError("");
    try {
      await deleteSupplier(supplier._id);
      setSuppliers((prev) =>
        prev.map((s) =>
          s._id === supplier._id ? { ...s, isDeleted: true } : s,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete supplier");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (supplier) => {
    setRestoringId(supplier._id);
    setError("");
    try {
      await restoreSupplier(supplier._id);
      setSuppliers((prev) =>
        prev.map((s) =>
          s._id === supplier._id ? { ...s, isDeleted: false } : s,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not restore supplier");
    } finally {
      setRestoringId(null);
    }
  };

  // Inline status change — right from the list, no modal. Optimistic
  // update with rollback if the request fails.
  const handleStatusChange = async (supplier, newStatus) => {
    if (newStatus === supplier.status) return;
    const previous = supplier.status;
    setStatusUpdatingId(supplier._id);
    setStatusError("");
    setSuppliers((prev) =>
      prev.map((s) =>
        s._id === supplier._id ? { ...s, status: newStatus } : s,
      ),
    );
    try {
      await updateSupplier(supplier._id, { status: newStatus });
    } catch (err) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s._id === supplier._id ? { ...s, status: previous } : s,
        ),
      );
      setStatusError(
        err.response?.data?.message || "Could not update status — reverted",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleUpdated = (updated) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s._id === editingSupplier._id ? { ...s, ...updated } : s,
      ),
    );
    setViewingSupplier((prev) =>
      prev && prev._id === editingSupplier._id ? { ...prev, ...updated } : prev,
    );
    setEditingSupplier(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[16px] font-bold text-emerald-800 tracking-wide uppercase">
          Suppliers {!isLoading && `(${suppliers.length})`}
        </h4>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 text-[16px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
        >
          <FiPlus size={14} /> Add Supplier
        </button>
      </div>

      {error && <p className="text-[16px] text-red-500 mb-2">{error}</p>}
      {statusError && (
        <p className="text-[16px] text-red-500 mb-2">{statusError}</p>
      )}

      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[16px] text-emerald-700/40 italic">Loading...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-[16px] text-emerald-700/40 italic">
            No suppliers yet
          </p>
        ) : (
          suppliers.map((sup) => (
            <div
              key={sup._id}
              onClick={() => !sup.isDeleted && setViewingSupplier(sup)}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-colors ${
                sup.isDeleted
                  ? "bg-slate-50 border-slate-200 opacity-70"
                  : "bg-emerald-50/40 border-emerald-300/30 cursor-pointer hover:bg-emerald-50"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-[16px] font-semibold truncate ${
                    sup.isDeleted
                      ? "text-slate-500 line-through"
                      : "text-emerald-900"
                  }`}
                >
                  {sup.suppliersName}
                  <span
                    className={
                      sup.isDeleted
                        ? "text-slate-400 font-medium"
                        : "text-emerald-700/50 font-medium"
                    }
                  >
                    {" "}
                    · {sup.supplierCode}
                  </span>
                  {sup.isDeleted && (
                    <span className="ml-2 text-[16px] font-bold uppercase text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full no-underline">
                      Deleted
                    </span>
                  )}
                </p>
                <p
                  className={`text-[16px] truncate ${sup.isDeleted ? "text-slate-400" : "text-emerald-700/50"}`}
                >
                  {[sup.address?.city, sup.address?.country]
                    .filter(Boolean)
                    .join(", ") || "No address on file"}
                </p>
              </div>
              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {sup.isDeleted ? (
                  <button
                    type="button"
                    onClick={() => handleRestore(sup)}
                    disabled={restoringId === sup._id}
                    className="flex items-center gap-1 text-[16px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-md border border-blue-200 transition-colors disabled:opacity-50"
                    title="Restore supplier"
                  >
                    <FiRotateCcw size={15} />
                    {restoringId === sup._id ? "Restoring..." : "Restore"}
                  </button>
                ) : (
                  <>
                    {/* Inline status — styled like a badge but is a real
                        select, so status changes without opening any modal. */}
                    <select
                      value={sup.status}
                      disabled={statusUpdatingId === sup._id}
                      onChange={(e) => handleStatusChange(sup, e.target.value)}
                      className={`text-[16px] font-bold uppercase pl-2 pr-6 py-1 rounded-full border appearance-none cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${
                        STATUS_STYLES[sup.status] || STATUS_STYLES.Active
                      }`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23047857'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.4rem center",
                        backgroundSize: "0.9em",
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditingSupplier(sup)}
                      className="p-1.5 text-emerald-700/40 hover:text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                      title="Edit supplier"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sup)}
                      disabled={deletingId === sup._id}
                      className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete supplier"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </>
                )}
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

      {editingSupplier && (
        <SupplierAddModal
          editSupplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onUpdated={handleUpdated}
        />
      )}

      {viewingSupplier && !editingSupplier && (
        <SupplierDetailModal
          supplier={viewingSupplier}
          onClose={() => setViewingSupplier(null)}
          onEdit={() => setEditingSupplier(viewingSupplier)}
        />
      )}
    </div>
  );
};

export default SupplierManager;
