import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiTag, FiEdit2, FiRotateCcw } from "react-icons/fi";
import Swal from "sweetalert2";
import {
  searchCategories,
  deleteCategory,
  restoreCategory,
} from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import CategoryAddModal from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/CategoryAddModal";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    searchCategories("", controller.signal)
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(err.response?.data?.message || "Could not load categories");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  // Soft delete — confirm first, then mark it deleted in place (rather
  // than removing it from the list) so a Restore icon can bring it right
  // back without a refetch.
  const handleDelete = async (category) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Delete "${category.category}"?`,
      text: "It'll be moved to trash — you can restore it right after.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
    });
    if (!result.isConfirmed) return;

    setDeletingId(category._id);
    setError("");
    try {
      await deleteCategory(category._id);
      setCategories((prev) =>
        prev.map((c) =>
          c._id === category._id ? { ...c, isDeleted: true } : c,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (category) => {
    setRestoringId(category._id);
    setError("");
    try {
      await restoreCategory(category._id);
      setCategories((prev) =>
        prev.map((c) =>
          c._id === category._id ? { ...c, isDeleted: false } : c,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not restore category");
    } finally {
      setRestoringId(null);
    }
  };

  const handleUpdated = (updated) => {
    setCategories((prev) =>
      prev.map((c) =>
        c._id === editingCategory._id ? { ...c, ...updated } : c,
      ),
    );
    setEditingCategory(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[16px] font-bold text-emerald-800 tracking-wide uppercase">
          Categories {!isLoading && `(${categories.length})`}
        </h4>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 text-[16px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
        >
          <FiPlus size={14} /> Add Category
        </button>
      </div>

      {error && <p className="text-[16px] text-red-500 mb-2">{error}</p>}

      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[16px] text-emerald-700/40 italic">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-[16px] text-emerald-700/40 italic">
            No categories yet
          </p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-colors ${
                cat.isDeleted
                  ? "bg-slate-50 border-slate-200 opacity-70"
                  : "bg-emerald-50/40 border-emerald-300/30"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-[16px] font-semibold truncate ${
                    cat.isDeleted
                      ? "text-slate-500 line-through"
                      : "text-emerald-900"
                  }`}
                >
                  {cat.category}
                  {cat.isDeleted && (
                    <span className="ml-2 text-[16px] font-bold uppercase text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full no-underline">
                      Deleted
                    </span>
                  )}
                </p>
                {cat.subCategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.subCategories.map((sub, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-0.5 text-[16px] font-medium px-1.5 py-0.5 rounded-full border ${
                          cat.isDeleted
                            ? "text-slate-400 bg-white border-slate-200"
                            : "text-emerald-700 bg-white border-emerald-200"
                        }`}
                      >
                        <FiTag size={10} />
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {cat.isDeleted ? (
                  <button
                    type="button"
                    onClick={() => handleRestore(cat)}
                    disabled={restoringId === cat._id}
                    className="flex items-center gap-1 text-[16px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-md border border-blue-200 transition-colors disabled:opacity-50"
                    title="Restore category"
                  >
                    <FiRotateCcw size={15} />
                    {restoringId === cat._id ? "Restoring..." : "Restore"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 text-emerald-700/40 hover:text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                      title="Edit category"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat._id}
                      className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete category"
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
        <CategoryAddModal
          onClose={() => setIsAddOpen(false)}
          onCreated={(created) => setCategories((prev) => [...prev, created])}
        />
      )}

      {editingCategory && (
        <CategoryAddModal
          editCategory={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default CategoryManager;
