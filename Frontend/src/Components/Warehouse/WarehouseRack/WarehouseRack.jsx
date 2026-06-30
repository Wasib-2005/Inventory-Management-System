import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { occupancyColor } from "../Mockdata";
import { Package, Inbox, CornerDownRight } from "lucide-react";

const WarehouseRack = ({ rack, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState("bottom");

  const colorSettings = occupancyColor(rack.itemCount, rack.capacity);
  
  // Calculate specific operational metrics
  const pct = rack.capacity > 0 ? (rack.itemCount / rack.capacity) * 100 : 0;
  const availableSpace = Math.max(rack.capacity - rack.itemCount, 0);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportH = window.innerHeight;
    setTooltipPos(rect.top > viewportH * 0.60 ? "top" : "bottom");
    setIsHovered(true);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelect(rack)}
        style={colorSettings.style}
        className={`relative w-full rounded-xl border p-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${colorSettings.className}`}
      >
        <span className="text-sm font-extrabold">{rack.code}</span>
        <span className="text-[10px] font-semibold opacity-70">
          {rack.itemCount}/{rack.capacity}
        </span>
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{
              opacity: 0,
              y: tooltipPos === "top" ? -4 : 4,
              scale: 0.97,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPos === "top" ? -4 : 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-20 left-1/2 -translate-x-1/2 w-56 p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(31,41,55,0.15)] border border-emerald-300/60 flex flex-col gap-2.5 ${
              tooltipPos === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {/* Header: Rack Location & Capacity Percentage */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950">
                Rack {rack.code}
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                {Math.round(pct)}% Full
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-emerald-800">
                <Package size={11} className="text-emerald-600" />
                <span>Stored: <b>{rack.itemCount}</b></span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800">
                <Inbox size={11} className="text-emerald-600" />
                <span>Free: <b>{availableSpace}</b></span>
              </div>
            </div>

            {/* Pure Tailwind Capacity Gradient Bar Indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            {/* Products breakdown breakdown segment */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-900/40">
                Inventory Breakdown
              </span>
              
              {rack.products.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic px-1 py-0.5">Empty Slot</span>
              ) : (
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-0.5">
                  {rack.products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-[11px] font-medium text-slate-700 flex items-center gap-0.5 truncate">
                        <CornerDownRight size={9} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-1 rounded shrink-0 ml-2">
                        ×{p.qty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseRack;