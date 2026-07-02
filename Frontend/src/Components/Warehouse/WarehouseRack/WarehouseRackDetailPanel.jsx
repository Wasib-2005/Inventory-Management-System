import { motion, AnimatePresence } from "framer-motion";
import { Package, X } from "lucide-react";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import WarehouseShelfCard from "./WarehouseShelfCard";


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

          {!selectedRack.shelves || selectedRack.shelves.length === 0 ? (
            <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
              This rack has no shelves.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedRack.shelves.map((shelf) => (
                <WarehouseShelfCard key={shelf.id} shelf={shelf} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseRackDetailPanel;