import { useEffect, useRef, useState, useCallback } from "react";
import { FiPlus, FiCornerUpLeft, FiShield, FiTool, FiCheck, FiX, FiRotateCcw, FiCheckCircle } from "react-icons/fi";
import ReturnWarrantyModal from "./ReturnWarrantyModal";
import { getOrderServiceClaim, updateOrderServiceClaimStatus } from "./api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;
const LIMIT = 15;

const TYPES = [
  { id: "all", label: "All Types" },
  { id: "return", label: "Returns" },
  { id: "warranty", label: "Warranty" },
  { id: "guarantee", label: "Guarantee" },
];

const STATUSES = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
];

const TYPE_META = {
  return: { label: "Return", icon: FiCornerUpLeft, accent: "text-amber-600 bg-amber-50 border-amber-200" },
  warranty: { label: "Warranty Claim", icon: FiShield, accent: "text-purple-600 bg-purple-50 border-purple-200" },
  guarantee: { label: "Guarantee Claim", icon: FiTool, accent: "text-blue-600 bg-blue-50 border-blue-200" },
};

const RESOLUTION_STYLES = {
  Refund: "text-rose-600 bg-rose-50 border-rose-200",
  Replace: "text-blue-600 bg-blue-50 border-blue-200",
  Repair: "text-purple-600 bg-purple-50 border-purple-200",
  "Store Credit": "text-emerald-600 bg-emerald-50 border-emerald-200",
  Reject: "text-slate-500 bg-slate-100 border-slate-200",
};

const STATUS_STYLES = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  approved: "text-blue-600 bg-blue-50 border-blue-200",
  rejected: "text-rose-600 bg-rose-50 border-rose-200",
  completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const ReturnsWarrantyPanel = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setRecords([]);
    setPage(1);
    setHasMore(true);

    getOrderServiceClaim(
      {
        page: 1,
        limit: LIMIT,
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      },
      controller.signal,
    )
      .then((res) => {
        const data = res.data?.data || [];
        setRecords(data);
        setHasMore(Boolean(res.data?.hasMore) && data.length === LIMIT);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") setRecords([]);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [typeFilter, statusFilter, reloadKey]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getOrderServiceClaim({
      page: nextPage,
      limit: LIMIT,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    })
      .then((res) => {
        const data = res.data?.data || [];
        setRecords((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(Boolean(res.data?.hasMore) && data.length === LIMIT);
      })
      .finally(() => setIsLoadingMore(false));
  }, [isLoading, isLoadingMore, hasMore, page, typeFilter, statusFilter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleStatusChange = async (record, newStatus) => {
    setActionId(record._id);
    try {
      await updateOrderServiceClaimStatus(record._id, newStatus);
      setRecords((prev) =>
        prev.map((r) => (r._id === record._id ? { ...r, status: newStatus } : r)),
      );
    } catch (err) {
      // swallow — could surface a toast here
    } finally {
      setActionId(null);
    }
  };

  const renderActions = (r) => {
    const busy = actionId === r._id;
    const btn = (label, icon, status, cls) => (
      <button
        key={status}
        type="button"
        disabled={busy}
        onClick={() => handleStatusChange(r, status)}
        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors disabled:opacity-40 ${cls}`}
      >
        {icon} {label}
      </button>
    );

    if (r.status === "pending") {
      return (
        <>
          {btn("Approve", <FiCheck size={11} />, "approved", "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100")}
          {btn("Reject", <FiX size={11} />, "rejected", "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100")}
        </>
      );
    }
    if (r.status === "approved") {
      return (
        <>
          {btn("Complete", <FiCheckCircle size={11} />, "completed", "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100")}
          {btn("Unclaim", <FiRotateCcw size={11} />, "pending", "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200")}
        </>
      );
    }
    if (r.status === "rejected" || r.status === "completed") {
      return btn("Unclaim", <FiRotateCcw size={11} />, "pending", "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200");
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Returns & Warranty Claims</h3>
          <p className="text-xs text-emerald-700/50 mt-0.5">
            Log and process customer returns, warranty & guarantee claims
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

      <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1 overflow-x-scroll">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`flex-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide py-1.5 px-2.5 rounded-md transition-colors ${
              typeFilter === t.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/50 hover:text-emerald-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-scroll">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStatusFilter(s.id)}
            className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wide py-1 px-2.5 rounded-full border transition-colors ${
              statusFilter === s.id
                ? "bg-emerald-600 text-white border-emerald-600"
                : "text-emerald-700/50 border-emerald-300/40 hover:text-emerald-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[12px] text-emerald-700/40 italic">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No claims yet</p>
        ) : (
          <>
            {records.map((r) => {
              const meta = TYPE_META[r.type] || TYPE_META.return;
              const Icon = meta.icon;
              return (
                <div
                  key={r._id}
                  className="flex flex-col gap-2 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
                >
                  <div className="flex items-center justify-between gap-2">
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
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                          STATUS_STYLES[r.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {r.status || "pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">{renderActions(r)}</div>
                </div>
              );
            })}
            <div ref={sentinelRef} className="h-1" />
            {isLoadingMore && (
              <p className="text-[11px] text-emerald-700/40 italic text-center py-1">Loading more...</p>
            )}
          </>
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