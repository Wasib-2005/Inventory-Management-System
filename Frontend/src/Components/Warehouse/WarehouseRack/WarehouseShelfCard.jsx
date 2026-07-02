import { PackageOpen } from "lucide-react";
import { occupancyColor } from "../MockData";

const WarehouseShelfCard = ({ shelf }) => {
  const pct = shelf.capacity > 0 ? (shelf.itemCount / shelf.capacity) * 100 : 0;
  const colorSettings = occupancyColor(shelf.itemCount, shelf.capacity);

  return (
    <div className="rounded-xl border border-emerald-300/40 bg-white/50 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-900">{shelf.name}</span>
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colorSettings.style.backgroundColor }}
        >
          {shelf.itemCount}/{shelf.capacity}
        </span>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#22c55e]"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {shelf.products.length === 0 ? (
        <p className="text-[11px] text-emerald-700/40 font-semibold py-1 text-center flex items-center justify-center gap-1">
          <PackageOpen size={12} />
          Empty shelf
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {shelf.products.map((p) => {
            const pColor = occupancyColor(p.qty, p.maxQty);
            const pPct = p.maxQty > 0 ? (p.qty / p.maxQty) * 100 : 0;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-1 px-2 py-1 rounded-lg bg-white/60 border border-emerald-300/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-900">{p.name}</span>
                  <span
                    className="text-[10px] font-bold px-1 rounded"
                    style={{ backgroundColor: pColor.style.backgroundColor }}
                  >
                    {p.qty}/{p.maxQty}
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