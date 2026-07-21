import { useEffect, useState } from "react";
import { FiPlus, FiCornerUpLeft, FiShield } from "react-icons/fi";
import ReturnWarrantyModal from "./ReturnWarrantyModal";
import { getReturnClaims } from "./api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const TYPES = [
  { id: "all", label: "All" },
  { id: "return", label: "Returns" },
  { id: "warranty", label: "Warranty Claims" },
];

const TYPE_META = {
  return: { label: "Return", icon: FiCornerUpLeft, accent: "text-amber-600 bg-amber-50 border-amber-200" },
  warranty: { label: "Warranty Claim", icon: FiShield, accent: "text-purple-600 bg-purple-50 border-purple-200" },
};

const RESOLUTION_STYLES = {
  Refund: "text-rose-600 bg-rose-50 border-rose-200",
  Replace: "text-blue-600 bg-blue-50 border-blue-200",
  Repair: "text-purple-600 bg-purple-50 border-purple-200",
  "Store Credit": "text-emerald-600 bg-emerald-50 border-emerald-200",
  Reject: "text-slate-500 bg-slate-100 border-slate-200",
};

const ReturnsWarrantyPanel = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    getReturnClaims(controller.signal)
      .then((res) => setRecords(res.data?.data || []))
      .catch((err) => {
        if (err.name !== "CanceledError") setIsLoading(false);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const filtered = filter === "all" ? records : records.filter((r) => r.type === filter);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Returns & Warranty Claims</h3>
          <p className="text-xs text-emerald-700/50 mt-0.5">
            Log customer returns and warranty claims
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <FiPlus size={14} />
          New Claim
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
        ) : filtered.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No claims yet</p>
        ) : (
          filtered.map((r) => {
            const meta = TYPE_META[r.type] || TYPE_META.return;
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
                    <p className="text-[12px] font-semibold text-emerald-900 truncate">
                      {r.productName} × {r.qty}
                    </p>
                    <p className="text-[10px] text-emerald-700/50 truncate">
                      {r.reference} · {r.reason}
                      {r.username ? ` · ${r.username}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  {r.resolution === "Refund" && r.refundAmount > 0 && (
                    <span className="text-[11px] font-bold text-rose-600">
                      -{currency}
                      {Number(r.refundAmount).toLocaleString()}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                      RESOLUTION_STYLES[r.resolution] || RESOLUTION_STYLES.Reject
                    }`}
                  >
                    {r.resolution}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ReturnWarrantyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          setReloadKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default ReturnsWarrantyPanel;