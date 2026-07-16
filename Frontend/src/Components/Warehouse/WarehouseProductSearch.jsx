import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbSearch, TbPackage, TbBuildingWarehouse, TbX } from "react-icons/tb";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { commonFieldColour } from "../../Theme/commonFieldColour";
import { commonInputField } from "../../Theme/commonInputField";

// racks: flat array from the selected warehouse's rackdata (populated)
// onLocateRack(rackCode): parent scrolls to + flashes the matching rack
const WarehouseProductSearch = ({ racks, onLocateRack }) => {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    (racks || []).forEach((rack) => {
      // Match by rack code
      if (rack.rackCode?.toLowerCase().includes(q)) {
        results.push({
          key: `rack-${rack._id}`,
          type: "rack",
          label: rack.rackCode,
          sublabel: rack.group?.groupName ? `Group: ${rack.group.groupName}` : `Column ${rack.column}`,
          rackCode: rack.rackCode,
        });
      }

      // Match by product name / sku / displayId within this rack's shelves
      (rack.shelfData || []).forEach((shelf) => {
        (shelf.productData || []).forEach((p) => {
          const name = p.productInfo?.name || "";
          const sku = p.productInfo?.sku || "";
          const displayId = p.productInfo?.displayId || "";

          if (
            name.toLowerCase().includes(q) ||
            sku.toLowerCase().includes(q) ||
            displayId.toLowerCase().includes(q)
          ) {
            results.push({
              key: `product-${p._id}`,
              type: "product",
              label: name || sku,
              sublabel: `Rack ${rack.rackCode} · ${shelf.shelfCode} · ${
                p.stock?.inStock ?? 0
              }/${p.stock?.maxStock ?? 0}`,
              rackCode: rack.rackCode,
            });
          }
        });
      });
    });

    return results.slice(0, 20);
  }, [query, racks]);

  const handleSelect = (rackCode) => {
    onLocateRack(rackCode);
    setQuery("");
  };

  return (
    <div className={`${commonComponentBG()} p-3 relative`}>
      <div className="relative">
        <TbSearch size={14} className={commonFieldColour.icon} style={{ top: "12px" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by rack code or product..."
          className={`${commonInputField} pl-8 pr-8`}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700/50 hover:text-emerald-900 transition-colors"
          >
            <TbX size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 left-3 right-3 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(31,41,55,0.15)] border border-emerald-300/60 flex flex-col"
          >
            {matches.length === 0 ? (
              <p className="text-xs text-emerald-700/40 font-semibold py-4 text-center">
                No matching racks or products.
              </p>
            ) : (
              matches.map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleSelect(m.rackCode)}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-emerald-50/70 transition-colors border-b border-emerald-100/60 last:border-0"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {m.type === "rack" ? (
                      <TbBuildingWarehouse size={13} className="text-emerald-600 shrink-0" />
                    ) : (
                      <TbPackage size={13} className="text-emerald-600 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-emerald-900 truncate">
                      {m.label}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700/60 shrink-0">
                    {m.sublabel}
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseProductSearch;
