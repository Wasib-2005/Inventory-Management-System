import { motion, AnimatePresence } from "framer-motion";
import { TbMapPin, TbHash, TbPlus, TbX, TbEdit } from "react-icons/tb";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { commonInputField } from "../../Theme/commonInputField";
import { primaryButton } from "../../Theme/primaryButton";
import IconActionButton from "../Common/IconActionButton";

const WarehouseSelectorModal = ({
  isOpen,
  onClose,
  placeQuery,
  setPlaceQuery,
  idQuery,
  setIdQuery,
  filteredWarehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onCreateWarehouse,
  onEditWarehouse,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`${commonComponentBG()} w-full max-w-md p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">
                Select Warehouse
              </h3>
              <button
                onClick={onClose}
                className="text-emerald-700/50 hover:text-emerald-900 transition-colors"
              >
                <TbX size={16} />
              </button>
            </div>

            <div className="relative">
              <TbMapPin size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="Search by place..."
                className={`${commonInputField} pl-8`}
              />
            </div>

            <div className="relative">
              <TbHash size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
              <input
                type="text"
                value={idQuery}
                onChange={(e) => setIdQuery(e.target.value)}
                placeholder="Search by warehouse ID..."
                className={`${commonInputField} pl-8`}
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {filteredWarehouses.length === 0 ? (
                <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                  No warehouses found.
                </p>
              ) : (
                filteredWarehouses.map((w) => (
                  <div
                    key={w.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
                      selectedWarehouse.id === w.id
                        ? "bg-emerald-200/60 border-emerald-400/70"
                        : "bg-white/40 border-emerald-300/40 hover:bg-white/60"
                    }`}
                  >
                    <button
                      onClick={() => onSelectWarehouse(w)}
                      className="flex-1 text-left"
                    >
                      <span className="text-xs font-bold text-emerald-900">{w.place}</span>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700/50">{w.id}</span>
                      <IconActionButton
                        icon={TbEdit}
                        label="Edit"
                        iconSize={13}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditWarehouse(w);
                        }}
                        className="p-1.5 rounded-md bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 border border-amber-200/50 transition-colors"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              className={primaryButton}
              style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
              onClick={onCreateWarehouse}
            >
              <TbPlus size={15} />
              Create Warehouse
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseSelectorModal;