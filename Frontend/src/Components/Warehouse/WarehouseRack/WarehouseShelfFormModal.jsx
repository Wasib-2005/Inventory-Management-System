import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbHash, TbX, TbPlus, TbAlertTriangle, TbLayersLinked } from "react-icons/tb";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { commonFieldColour } from "../../../Theme/commonFieldColour";
import { commonInputField } from "../../../Theme/commonInputField";
import { primaryButton } from "../../../Theme/primaryButton";

// rack: the rack this shelf is being added to (for display only)
// onSubmit receives { shelfCode }
const WarehouseShelfFormModal = ({ isOpen, rack, onClose, onSubmit }) => {
  const [shelfCode, setShelfCode] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShelfCode("");
    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  if (!rack) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shelfCode || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit({ shelfCode });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to add shelf.");
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-emerald-950/30 backdrop-blur-sm p-4"
          onClick={() => !isSubmitting && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`${commonComponentBG()} w-full max-w-sm p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60 flex items-center gap-1.5">
                <TbLayersLinked size={14} />
                Add Shelf to {rack.rackCode}
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
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
                <TbHash size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isSubmitting}
                  value={shelfCode}
                  onChange={(e) => setShelfCode(e.target.value)}
                  placeholder="Shelf Code (e.g., SHELF-SECURE-A)"
                  className={`${commonInputField} pl-8 disabled:opacity-60`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-200">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className={`${primaryButton} disabled:opacity-50`}
                  style={{ backgroundColor: "Black", color: "#fff" }}
                >
                  <TbX size={15} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${primaryButton} disabled:opacity-50`}
                  style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
                >
                  <TbPlus size={15} />
                  {isSubmitting ? "Adding..." : "Add Shelf"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseShelfFormModal;
