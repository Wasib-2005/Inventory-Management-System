import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiTag, FiEdit2 } from "react-icons/fi";
import {
  searchCategories,
  deleteCategory,
} from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/api";
import CategoryAddModal from "../../ProductsComponents/ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/CategoryAddModal";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (category) => {
    if (
      !window.confirm(
        `Delete category "${category.category}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(category._id);
    setError("");
    try {
      await deleteCategory(category._id);
      setCategories((prev) => prev.filter((c) => c._id !== category._id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdated = (updated) => {
    setCategories((prev) =>
      prev.map((c) => (c._id === editingCategory._id ? { ...c, ...updated } : c)),
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
              className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
            >
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-emerald-900 truncate">
                  {cat.category}
                </p>
                {cat.subCategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.subCategories.map((sub, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-0.5 text-[16px] font-medium text-emerald-700 bg-white px-1.5 py-0.5 rounded-full border border-emerald-200"
                      >
                        <FiTag size={10} />
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
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