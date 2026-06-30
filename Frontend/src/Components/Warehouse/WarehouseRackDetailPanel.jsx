import { motion, AnimatePresence } from "framer-motion";
import { Package, X } from "lucide-react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";

const WarehouseRackDetailPanel = ({ selectedRack, onClose }) => {
  return (
    <AnimatePresence>
      {selectedRack && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          className={`${commonComponentBG()} p-4 sm:p-6 overflow-hidden`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Package size={16} color={PALETTE.steel} />
              Rack {selectedRack.code}
            </h3>
            <button
              onClick={onClose}
              className="text-emerald-700/50 hover:text-emerald-900 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {selectedRack.products.length === 0 ? (
            <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
              This rack is empty.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedRack.products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 border border-emerald-300/40"
                >
                  <span className="text-xs font-semibold text-emerald-900">{p.name}</span>
                  <span className="text-[11px] font-bold text-emerald-700/60">
                    Qty: {p.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseRackDetailPanel;