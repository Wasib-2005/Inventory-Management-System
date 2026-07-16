import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbMapPin,
  TbHash,
  TbPlus,
  TbX,
  TbEdit,
  TbAlertTriangle,
  TbTrash,
} from "react-icons/tb";
import { SiNamesilo } from "react-icons/si";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { commonInputField } from "../../Theme/commonInputField";
import { primaryButton } from "../../Theme/primaryButton";

const emptyForm = {
  warehouseId: "",
  warehouseName: "",
  place: "",
  address: "",
};

// initialData follows the real warehouse shape: { _id, warehouseId, warehouseName, place, address }
const WarehouseFormModal = ({
  isOpen,
  mode = "create",
  initialData,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const isEdit = mode === "edit";

  const [warehouseId, setWarehouseId] = useState(emptyForm.warehouseId);
  const [warehouseName, setWarehouseName] = useState(emptyForm.warehouseName);
  const [place, setPlace] = useState(emptyForm.place);
  const [address, setAddress] = useState(emptyForm.address);
  const [error, setError] = useState(null);

  // Core state that freezes the entire UI on submit/delete
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setIsSubmitting(false); // Reset state when opening modal

    if (isEdit && initialData) {
      setWarehouseId(initialData.warehouseId ?? "");
      setWarehouseName(initialData.warehouseName ?? "");
      setPlace(initialData.place ?? "");
      setAddress(initialData.address ?? "");
    } else {
      setWarehouseId(emptyForm.warehouseId);
      setWarehouseName(emptyForm.warehouseName);
      setPlace(emptyForm.place);
      setAddress(emptyForm.address);
    }
  }, [isOpen, isEdit, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouseName || !warehouseId || !place || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit({
        warehouseId,
        warehouseName,
        place,
        address,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false); // Thaw form if error happens so user can fix it
        return;
      }

      onClose();
    } catch (err) {
      setError(err?.message || "An unexpected error occurred while saving.");
      console.error("Error during warehouse submission:", err);
      setIsSubmitting(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!onDelete || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onDelete(initialData._id);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to delete the warehouse.");
      console.error("Error during warehouse deletion:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 backdrop-blur-sm p-4 overflow-auto"
          onClick={() => !isSubmitting && onClose()} // Prevent click-outside closing during requests
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`${commonComponentBG()} w-full max-w-md p-5 flex flex-col gap-4 ${
              isSubmitting
                ? "cursor-wait opacity-80 pointer-events-none select-none"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">
                {isEdit ? "Edit Warehouse" : "Create New Warehouse"}
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="text-emerald-700/50 hover:text-emerald-900 transition-colors disabled:opacity-30"
              >
                <TbX size={16} />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                <TbAlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <TbHash
                  size={14}
                  className={commonFieldColour.icon}
                  style={{ top: "12px" }}
                />
                <input
                  type="text"
                  required
                  disabled={isEdit || isSubmitting}
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  placeholder="Warehouse ID (e.g., WH-001)"
                  className={`${commonInputField} pl-8 ${
                    isEdit || isSubmitting
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>
              <div className="relative">
                <SiNamesilo
                  size={14}
                  className={commonFieldColour.icon}
                  style={{ top: "12px" }}
                />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="Warehouse Name (e.g., Dhaka Central Depot)"
                  className={`${commonInputField} pl-8 disabled:opacity-60`}
                />
              </div>

              <div className="relative">
                <TbMapPin
                  size={14}
                  className={commonFieldColour.icon}
                  style={{ top: "12px" }}
                />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Place (e.g., Dhaka Central Depot)"
                  className={`${commonInputField} pl-8 disabled:opacity-60`}
                />
              </div>

              <div className="relative">
                <TbMapPin
                  size={14}
                  className={commonFieldColour.icon}
                  style={{ top: "12px" }}
                />
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full Address"
                  className={`${commonInputField} pl-8 disabled:opacity-60`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200">
                <button
                  disabled={isSubmitting}
                  type="button"
                  onClick={onClose}
                  className={`${primaryButton} disabled:opacity-50`}
                  style={{ backgroundColor: "Black", color: "#fff" }}
                >
                  <TbX size={15} />
                  Cancel
                </button>

                {isEdit && (
                  <button
                    disabled={isSubmitting}
                    type="button"
                    onClick={handleDeleteAction}
                    className={`${primaryButton} disabled:opacity-50`}
                    style={{ backgroundColor: "#FF0000", color: "#fff" }}
                  >
                    <TbTrash size={15} />
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                )}

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`${primaryButton} disabled:opacity-50`}
                  style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
                >
                  {isEdit ? <TbEdit size={15} /> : <TbPlus size={15} />}
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseFormModal;
