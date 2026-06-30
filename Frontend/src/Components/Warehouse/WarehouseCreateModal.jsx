import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Hash, Plus, X, Layers, Grid } from "lucide-react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PALETTE } from "../../Theme/palette";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { commonInputField } from "../../Theme/commonInputField";
import { primaryButton } from "../../Theme/primaryButton";

// Helper to calculate the next alphabetical rack row identifier (A -> B ... Z -> AA)
const getNextRackName = (currentRows) => {
  if (currentRows.length === 0) return "A";
  const last = currentRows[currentRows.length - 1];
  
  let i = last.length - 1;
  while (i >= 0 && last[i] === 'Z') {
    i--;
  }
  
  if (i < 0) {
    return "A".repeat(last.length + 1);
  }
  
  const nextChar = String.fromCharCode(last.charCodeAt(i) + 1);
  return last.slice(0, i) + nextChar + "A".repeat(last.length - 1 - i);
};

const WarehouseCreateModal = ({ isOpen, onClose, onCreateSubmit }) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [place, setPlace] = useState("");
  const [address, setAddress] = useState("");
  const [rackRows, setRackRows] = useState(["A", "B", "C", "D"]);
  const [racksPerRow, setRacksPerRow] = useState(5);

  const handleAddRow = () => {
    const nextRowName = getNextRackName(rackRows);
    setRackRows([...rackRows, nextRowName]);
  };

  const handleRemoveRow = (indexToRemove) => {
    // Only allow removing the last row to maintain continuous grid schema sequence
    if (indexToRemove === rackRows.length - 1) {
      setRackRows(rackRows.slice(0, -1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!warehouseId || !place) return; // Basic validation
    
    onCreateSubmit({
      warehouseId,
      place,
      address,
      rackRows,
      racksPerRow: Number(racksPerRow),
    });
    
    // Reset state and close
    setWarehouseId("");
    setPlace("");
    setAddress("");
    setRackRows(["A", "B", "C", "D"]);
    setRacksPerRow(5);
    onClose();
  };

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-900/60">
                Create New Warehouse
              </h3>
              <button
                onClick={onClose}
                className="text-emerald-700/50 hover:text-emerald-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Warehouse ID */}
              <div className="relative">
                <Hash size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
                <input
                  type="text"
                  required
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  placeholder="Warehouse ID (e.g., WH-001)"
                  className={`${commonInputField} pl-8`}
                />
              </div>

              {/* Place Name */}
              <div className="relative">
                <MapPin size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
                <input
                  type="text"
                  required
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Place (e.g., Dhaka Central Depot)"
                  className={`${commonInputField} pl-8`}
                />
              </div>

              {/* Address */}
              <div className="relative">
                <MapPin size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full Address"
                  className={`${commonInputField} pl-8`}
                />
              </div>

              {/* Grid System Controls */}
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 flex items-center gap-1">
                    <Grid size={11} /> Racks Per Row
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={racksPerRow}
                    onChange={(e) => setRacksPerRow(e.target.value)}
                    className={`${commonInputField} py-1 text-xs`}
                  />
                </div>
              </div>

              {/* Dynamic Rack Rows List Wrapper */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 flex items-center gap-1">
                  <Layers size={11} /> Defined Rows Map
                </label>
                
                {/* Visual grid arrays */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-white/40 border border-emerald-300/30 rounded-lg max-h-24 overflow-y-auto">
                  {rackRows.map((row, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded bg-emerald-100 text-emerald-900 border border-emerald-300/40 group relative"
                    >
                      {row}
                      {index === rackRows.length - 1 && rackRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-500 hover:text-red-700 ml-1 font-normal text-[9px]"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Append / Extend Button */}
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    + Add Row ({getNextRackName(rackRows)})
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={primaryButton}
                style={{ backgroundColor: PALETTE.mint, color: "#fff" }}
              >
                <Plus size={15} />
                Save New Warehouse
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseCreateModal;