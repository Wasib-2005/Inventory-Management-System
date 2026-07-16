import { PackageOpen } from "lucide-react";
import { occupancyColor, computeShelfStats, isProductLow } from "../utils";

const WarehouseShelfCard = ({ shelf }) => {
  const { itemCount, capacity } = computeShelfStats(shelf);
  const pct = capacity > 0 ? (itemCount / capacity) * 100 : 0;
  const colorSettings = occupancyColor(itemCount, capacity);
  const products = shelf.productData || [];

  return (
    <div className="rounded-xl border border-emerald-300/40 bg-white/50 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-900">{shelf.shelfCode}</span>
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colorSettings.style.backgroundColor }}
        >
          {itemCount}/{capacity}
        </span>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {products.length === 0 ? (
        <p className="text-[11px] text-emerald-700/40 font-semibold py-1 text-center flex items-center justify-center gap-1">
          <PackageOpen size={12} />
          Empty shelf
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {products.map((p) => {
            const inStock = p.stock?.inStock ?? 0;
            const maxStock = p.stock?.maxStock ?? 0;
            const pColor = occupancyColor(inStock, maxStock);
            const pPct = maxStock > 0 ? (inStock / maxStock) * 100 : 0;
            return (
              <div
                key={p._id}
                className="flex flex-col gap-1 px-2 py-1 rounded-lg bg-white/60 border border-emerald-300/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-emerald-900 truncate">
                    {p.productInfo?.name}
                    {isProductLow(p) && (
                      <span className="ml-1 text-[9px] font-bold text-red-600">
                        low
                      </span>
                    )}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1 rounded shrink-0"
                    style={{ backgroundColor: pColor.style.backgroundColor }}
                  >
                    {inStock}/{maxStock}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
                    style={{ width: `${Math.min(pPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WarehouseShelfCard;
