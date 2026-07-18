import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Inbox, Layers, CornerDownRight } from "lucide-react";
import {
  occupancyColor,
  computeRackStats,
  computeShelfStats,
  getGroupColour,
  hexToRgba,
} from "../utils";

const WarehouseRack = ({ rack, onSelect, isHighlighted }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState("bottom");

  const shelves = rack.shelfData || [];
  const { itemCount, capacity } = computeRackStats(rack);
  const rackColor = occupancyColor(itemCount, capacity);
  const pct = capacity > 0 ? (itemCount / capacity) * 100 : 0;
  const availableSpace = Math.max(capacity - itemCount, 0);

  const groupColor = getGroupColour(rack.group);
  const groupName = rack.group?.groupName;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportH = window.innerHeight;
    setTooltipPos(rect.top > viewportH * 0.6 ? "top" : "bottom");
    setIsHovered(true);
  };

  return (
    <div
      id={`rack-${rack.rackCode}`}
      className={`relative ${rack?.isDeleted && "opacity-20"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelect(rack)}
        style={{
          backgroundColor: hexToRgba(groupColor, 0.22),
          borderColor: groupColor,
        }}
        className={`relative w-full rounded-md border-x-[3px] border-t-[3px] border-b-[6px] flex flex-col gap-[3px] p-1.5 pb-1 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
          isHighlighted
            ? "ring-4 ring-amber-400 ring-offset-2 shadow-[0_0_22px_rgba(251,191,36,0.85)] scale-[1.06]"
            : ""
        }`}
      >
        <span className="text-[9px] font-black text-slate-700 text-center leading-none truncate px-0.5">
          {rack.rackCode}
        </span>

        <div className="flex flex-col gap-[3px]">
          {shelves.map((shelf) => {
            const shelfStats = computeShelfStats(shelf);
            const shelfColor = occupancyColor(
              shelfStats.itemCount,
              shelfStats.capacity,
            );
            return (
              <div
                key={shelf._id}
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
          {itemCount}/{capacity}
        </span>
      </button>

      <AnimatePresence>
        {isHovered && !rack.isDeleted && (
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
                Rack {rack.rackCode}
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                {Math.round(pct)}% Full
              </span>
            </div>

            {groupName && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800/80 -mt-1.5">
                <span
                  className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: groupColor }}
                />
                {groupName}
                <span className="text-emerald-700/40 font-semibold">
                  · Column {rack.column}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-emerald-800">
                <Package size={11} className="text-emerald-600" />
                <span>
                  Stored: <b>{itemCount}</b>
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800">
                <Inbox size={11} className="text-emerald-600" />
                <span>
                  Free: <b>{availableSpace}</b>
                </span>
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
                {shelves.length === 0 && (
                  <p className="text-[10px] text-emerald-700/40 font-semibold py-1 text-center">
                    No shelves yet.
                  </p>
                )}
                {shelves.map((shelf) => {
                  const shelfStats = computeShelfStats(shelf);
                  const shelfPct =
                    shelfStats.capacity > 0
                      ? (shelfStats.itemCount / shelfStats.capacity) * 100
                      : 0;
                  const products = shelf.productData || [];

                  return (
                    <div
                      key={shelf._id}
                      className="flex flex-col gap-0.5 py-0.5 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                          <CornerDownRight
                            size={9}
                            className="text-emerald-500 shrink-0"
                          />
                          {shelf.shelfCode}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-900 bg-emerald-50 px-1 rounded shrink-0">
                          {shelfStats.itemCount}/{shelfStats.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden ml-3.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                          style={{ width: `${Math.min(shelfPct, 100)}%` }}
                        />
                      </div>

                      {products.length > 0 && (
                        <div className="flex flex-col gap-0.5 ml-3.5 mt-0.5">
                          {products.map((p) => (
                            <div
                              key={p._id}
                              className="flex items-center justify-between text-[9px] text-slate-600"
                            >
                              <span className="truncate max-w-[110px]">
                                {p.productInfo?.name}
                              </span>
                              <span className="font-semibold shrink-0">
                                {p.stock?.inStock ?? 0}/{p.stock?.maxStock ?? 0}
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
