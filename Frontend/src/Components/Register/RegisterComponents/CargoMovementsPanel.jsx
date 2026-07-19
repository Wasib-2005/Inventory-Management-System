import { useEffect, useState } from "react";
import { FiPlus, FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import { AiOutlineBarcode } from "react-icons/ai";
import StockMovementModal from "./OrderComponents/StockMovementModal";
import { getStockMovements } from "./OrderComponents/api";

const TYPES = [
  { id: "all", label: "All" },
  { id: "inbound", label: "Inbound" },
  { id: "outbound", label: "Outbound" },
  { id: "count", label: "Cycle Count" },
];

const TYPE_META = {
  inbound: { label: "Inbound", icon: FiArrowDownLeft, accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  outbound: { label: "Outbound", icon: FiArrowUpRight, accent: "text-amber-600 bg-amber-50 border-amber-200" },
  count: { label: "Cycle Count", icon: AiOutlineBarcode, accent: "text-purple-600 bg-purple-50 border-purple-200" },
};

const CargoMovementsPanel = () => {
  const [filter, setFilter] = useState("all");
  const [modalType, setModalType] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const load = async () => {
      const types = filter === "all" ? ["inbound", "outbound", "count"] : [filter];
      const results = await Promise.all(
        types.map((t) =>
          getStockMovements(t, controller.signal).then((res) =>
            (res.data?.data || []).map((r) => ({ ...r, _type: t })),
          ),
        ),
      );
      const merged = results
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecords(merged);
      setIsLoading(false);
    };

    load().catch((err) => {
      if (err.name !== "CanceledError") setIsLoading(false);
    });

    return () => controller.abort();
  }, [filter, reloadKey]);

  const createType = filter === "all" ? "inbound" : filter;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Cargo & Stock Movements</h3>
          <p className="text-xs text-emerald-700/50 mt-0.5">Receive, dispatch, and count inventory</p>
        </div>
        <button
          type="button"
          onClick={() => setModalType(createType)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <FiPlus size={14} />
          {filter === "all" ? "New Movement" : `New ${TYPE_META[filter]?.label}`}
        </button>
      </div>

      <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1 overflow-x-auto">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`flex-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide py-1.5 px-2.5 rounded-md transition-colors ${
              filter === t.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/50 hover:text-emerald-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 max-h-[45vh] overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[12px] text-emerald-700/40 italic">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No movements yet</p>
        ) : (
          records.map((r) => {
            const meta = TYPE_META[r._type];
            const Icon = meta.icon;
            return (
              <div
                key={r._id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${meta.accent}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-emerald-900 truncate">{r.reference}</p>
                    <p className="text-[10px] text-emerald-700/50">
                      {r.items?.length || 0} item(s){r.notes ? ` · ${r.notes}` : ""}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${meta.accent}`}>
                  {meta.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      <StockMovementModal
        type={modalType || "inbound"}
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onCreated={() => {
          setModalType(null);
          setReloadKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default CargoMovementsPanel;