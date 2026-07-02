import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Inbox, Layers, CornerDownRight } from "lucide-react";
import { occupancyColor } from "../MockData";

const WarehouseRack = ({ rack, onSelect, isHighlighted }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState("bottom");

  const rackColor = occupancyColor(rack.itemCount, rack.capacity);
  const pct = rack.capacity > 0 ? (rack.itemCount / rack.capacity) * 100 : 0;
  const availableSpace = Math.max(rack.capacity - rack.itemCount, 0);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportH = window.innerHeight;
    setTooltipPos(rect.top > viewportH * 0.6 ? "top" : "bottom");
    setIsHovered(true);
  };

  return (
    <div
      id={`rack-${rack.code}`}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rack frame: vertical posts + stacked horizontal shelf slats */}
      <button
        onClick={() => onSelect(rack)}
        className={`relative w-full rounded-md border-x-[3px] border-t-[3px] border-b-[6px] border-slate-500/70 bg-slate-200/50 flex flex-col gap-[3px] p-1.5 pb-1 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
          isHighlighted
            ? "ring-4 ring-amber-400 ring-offset-2 shadow-[0_0_22px_rgba(251,191,36,0.85)] scale-[1.06]"
            : ""
        }`}
      >
        <span className="text-[9px] font-black text-slate-700 text-center leading-none">
          {rack.code}
        </span>

        <div className="flex flex-col gap-[3px]">
          {rack.shelves.map((shelf) => {
            const shelfColor = occupancyColor(shelf.itemCount, shelf.capacity);
            return (
              <div
                key={shelf.id}
                style={shelfColor.style}
                className="h-2.5 rounded-[2px] border border-black/10 shadow-sm"
              />
            );
          })}
        </div>

        <span
          className="text-[8px] font-bold text-center leading-none mt-0.5 px-1 py-0.5 rounded"
          style={rackColor.style}
        >
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
            className={`absolute z-20 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(31,41,55,0.15)] border border-emerald-300/60 flex flex-col gap-2.5 ${
              tooltipPos === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950">
                Rack {rack.code}
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                {Math.round(pct)}% Full
              </span>
            </div>

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

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-900/40 flex items-center gap-1">
                <Layers size={9} /> Shelves
              </span>

              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                {rack.shelves.map((shelf) => {
                  const shelfPct =
                    shelf.capacity > 0 ? (shelf.itemCount / shelf.capacity) * 100 : 0;

                  return (
                    <div
                      key={shelf.id}
                      className="flex flex-col gap-0.5 py-0.5 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                          <CornerDownRight size={9} className="text-emerald-500 shrink-0" />
                          {shelf.name}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-900 bg-emerald-50 px-1 rounded shrink-0">
                          {shelf.itemCount}/{shelf.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden ml-3.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                          style={{ width: `${Math.min(shelfPct, 100)}%` }}
                        />
                      </div>

                      {shelf.products.length > 0 && (
                        <div className="flex flex-col gap-0.5 ml-3.5 mt-0.5">
                          {shelf.products.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-[9px] text-slate-600"
                            >
                              <span className="truncate max-w-[110px]">{p.name}</span>
                              <span className="font-semibold shrink-0">
                                {p.qty}/{p.maxQty}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseRack;