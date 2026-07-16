import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { commonComponentBG } from "../../../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../../../Theme/secondaryButton";
import { primaryButton } from "../../../../../Theme/primaryButton";
import { commonInputField } from "../../../../../Theme/commonInputField";
import { createCategory } from "./api";

const CategoryAddModal = ({ onClose, onCreated }) => {
  const [categoryName, setCategoryName] = useState("");
  const [subCategories, setSubCategories] = useState([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const updateSub = (index, value) =>
    setSubCategories((prev) => prev.map((s, i) => (i === index ? value : s)));

  const addSubRow = () => setSubCategories((prev) => [...prev, ""]);

  const removeSubRow = (index) =>
    setSubCategories((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        category: categoryName.trim(),
        subCategories: subCategories
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      };
      const res = await createCategory(payload);
      if (res.data?.success) {
        onCreated(res.data.data);
        onClose();
      } else {
        setError("Could not create category");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not create category");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-emerald-950/40 backdrop-blur-sm flex items-stretch sm:items-center sm:justify-center sm:p-6 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full h-full sm:h-auto sm:max-w-lg rounded-none sm:rounded-2xl cursor-default flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-emerald-300/40 bg-emerald-50 sm:rounded-t-2xl shrink-0">
          <h3 className="text-lg font-bold text-emerald-900">Add Category</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-white/80 hover:bg-white text-emerald-800"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={commonInputField}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
                Subcategories
              </label>
              <button
                type="button"
                onClick={addSubRow}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
              >
                <FiPlus size={12} /> Add Row
              </button>
            </div>
            {subCategories.map((sub, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Subcategory name"
                  value={sub}
                  onChange={(e) => updateSub(index, e.target.value)}
                  className={`${commonInputField} flex-1`}
                />
                {subCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubRow(index)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>

        <div className="p-4 border-t border-emerald-300/40 bg-emerald-50 sm:rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`${primaryButton} bg-[#1D9E75] text-white disabled:opacity-50`}
          >
            {isSaving ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CategoryAddModal;
