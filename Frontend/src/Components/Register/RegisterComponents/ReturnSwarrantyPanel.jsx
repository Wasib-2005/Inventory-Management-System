import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiPlus,
  FiCornerUpLeft,
  FiShield,
  FiTool,
  FiCheck,
  FiX,
  FiRotateCcw,
  FiCheckCircle,
} from "react-icons/fi";
import ReturnWarrantyModal from "./ReturnWarrantyModal";
import ClaimDetailModal from "./ClaimDetailModal";
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
  { id: "processing", label: "Processing" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
];

const TYPE_META = {
  return: {
    label: "Return",
    icon: FiCornerUpLeft,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
  warranty: {
    label: "Warranty Claim",
    icon: FiShield,
    accent: "text-purple-600 bg-purple-50 border-purple-200",
  },
  guarantee: {
    label: "Guarantee Claim",
    icon: FiTool,
    accent: "text-blue-600 bg-blue-50 border-blue-200",
  },
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
  processing: "text-indigo-600 bg-indigo-50 border-indigo-200",
  rejected: "text-rose-600 bg-rose-50 border-rose-200",
  completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const ReturnsWarrantyPanel = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
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
      await updateOrderServiceClaimStatus({
        type: record.type,
        id: record._id,
        status: newStatus,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id ? { ...r, status: newStatus } : r,
        ),
      );
      setSelectedClaim((prev) =>
        prev && prev._id === record._id ? { ...prev, status: newStatus } : prev,
      );
    } catch (err) {
      // swallow — could surface a toast here
    } finally {
      setActionId(null);
    }
  };

  const handleClaimedChange = async (record, newClaimed) => {
    setActionId(record._id);
    try {
      await updateOrderServiceClaimStatus({
        type: record.type,
        id: record._id,
        claimed: newClaimed,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id ? { ...r, claimed: newClaimed } : r,
        ),
      );
      setSelectedClaim((prev) =>
        prev && prev._id === record._id
          ? { ...prev, claimed: newClaimed }
          : prev,
      );
    } catch (err) {
      // swallow
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
        className={`flex items-center gap-1.5 text-base font-bold px-3 py-1.5 rounded-md border transition-colors disabled:opacity-40 ${cls}`}
      >
        {icon} {label}
      </button>
    );

    if (r.status === "pending") {
      return (
        <>
          {btn(
            "Approve",
            <FiCheck size={16} />,
            "approved",
            "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
          )}
          {btn(
            "Reject",
            <FiX size={16} />,
            "rejected",
            "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
          )}
        </>
      );
    }
    if (r.status === "approved") {
      return btn(
        "Start Processing",
        <FiRotateCcw size={16} />,
        "processing",
        "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      );
    }
    if (r.status === "processing") {
      return btn(
        "Complete",
        <FiCheckCircle size={16} />,
        "completed",
        "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-emerald-900">
            Returns & Warranty Claims
          </h3>
          <p className="text-base text-emerald-700/60 mt-1">
            Log and process customer returns, warranty & guarantee claims
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-base font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <FiPlus size={18} />
          New Claim
        </button>
      </div>

      <div className="flex p-1 rounded-lg bg-emerald-900/5 border border-emerald-300/30 gap-1 overflow-x-scroll">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`flex-1 whitespace-nowrap text-base font-bold uppercase tracking-wide py-2 px-3 rounded-md transition-colors ${
              typeFilter === t.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/60 hover:text-emerald-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-scroll">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStatusFilter(s.id)}
            className={`whitespace-nowrap text-base font-bold uppercase tracking-wide py-1.5 px-3 rounded-full border transition-colors ${
              statusFilter === s.id
                ? "bg-emerald-600 text-white border-emerald-600"
                : "text-emerald-700/60 border-emerald-300/40 hover:text-emerald-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-base text-emerald-700/50 italic">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-base text-emerald-700/50 italic">No claims yet</p>
        ) : (
          <>
            {records.map((r) => {
              const meta = TYPE_META[r.type] || TYPE_META.return;
              const Icon = meta.icon;
              return (
                <div
                  key={r._id}
                  onClick={() => setSelectedClaim(r)}
                  className="flex flex-col gap-3 p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30 cursor-pointer hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-md border flex items-center justify-center shrink-0 ${meta.accent}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-emerald-900 truncate">
                          {r.product?.name} × {Number(r.qty || 0).toLocaleString()}
                        </p>
                        <p className=" text-emerald-700/80 truncate">
                          {r.product?.displayId}
                          {r.reason ? ` · ${r.reason}` : ""}
                          {r.order?.customerId?.username
                            ? ` · ${r.order.customerId.username}`
                            : ""}
                          {`  · ${r.order?._id.slice(-8)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      {r.resolution === "Refund" && r.refundAmount > 0 && (
                        <span className="text-base font-bold text-rose-600">
                          -{currency}
                          {Number(r.refundAmount).toLocaleString()}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-base font-bold uppercase px-2.5 py-1 rounded-full border ${
                            RESOLUTION_STYLES[r.resolution] ||
                            RESOLUTION_STYLES.Reject
                          }`}
                        >
                          {r.resolution}
                        </span>
                        <span
                          className={`text-base font-bold uppercase px-2.5 py-1 rounded-full border ${
                            STATUS_STYLES[r.status] || STATUS_STYLES.pending
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderActions(r)}
                  </div>
                </div>
              );
            })}
            <div ref={sentinelRef} className="h-1" />
            {isLoadingMore && (
              <p className="text-base text-emerald-700/50 italic text-center py-2">
                Loading more...
              </p>
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

      <ClaimDetailModal
        isOpen={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        claim={selectedClaim}
        onStatusChange={handleStatusChange}
        onClaimedChange={handleClaimedChange}
        actionBusy={actionId === selectedClaim?._id}
      />
    </div>
  );
};

export default ReturnsWarrantyPanel;
