import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import StockMovementModal from "./OrderComponents/StockMovementModal";
import { getCycleCounts, getStockMovements } from "./api";
import MovementDetailModal from "./MovementDetailModal";
import CashMemoModal from "./OrderComponents/Cashmemomodal";
import { MOVEMENT_TYPE_META } from "./OrderComponents/movementConstants";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "inbound", label: "Inbound" },
  { id: "outbound", label: "Outbound" },
  { id: "count", label: "Cycle Count" },
];

const CargoMovementsPanel = () => {
  const [filter, setFilter] = useState("all");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Detail + edit
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [receiptRecord, setReceiptRecord] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const load = async () => {
      const types = filter === "all" ? ["inbound", "outbound"] : [filter];
      const results = await Promise.all([
        ...types.map((t) =>
          getStockMovements(t, controller.signal).then((res) =>
            (res.data?.data || []).map((r) => ({ ...r, _type: t })),
          ),
        ),
        ...(filter === "all" || filter === "count"
          ? [
              getCycleCounts(controller.signal).then((res) =>
                (res.data?.data || []).map((r) => ({ ...r, _type: "count" })),
              ),
            ]
          : []),
      ]);
      const merged = results
        .flat()
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setRecords(merged);
      setIsLoading(false);
    };

    load().catch((err) => {
      if (err.name !== "CanceledError") setIsLoading(false);
    });

    return () => controller.abort();
  }, [filter, reloadKey]);

  const createType = filter === "all" ? "inbound" : filter;

  const handleEditFromDetail = (record) => {
    setSelectedRecord(null);
    setEditRecord(record);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-emerald-900">Cargo & Stock Movements</h3>
          <p className="text-base text-emerald-700/70 mt-1">Receive, dispatch, count, and verify inventory activity.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 text-base font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-4 py-3 rounded-lg transition-colors shrink-0"
        >
          <FiPlus size={14} />
          New Movement
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 p-1 rounded-xl bg-emerald-900/5 border border-emerald-300/30 gap-1">
        {FILTERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`whitespace-nowrap text-base font-bold uppercase tracking-wide py-2.5 px-2 rounded-lg transition-colors ${
              filter === t.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-emerald-700/50 hover:text-emerald-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-base text-emerald-700/60 italic">Loading movements...</p>
        ) : records.length === 0 ? (
          <p className="text-base text-emerald-700/60 italic">No movements yet</p>
        ) : (
          records.map((r) => {
            const meta = MOVEMENT_TYPE_META[r._type];
            const Icon = meta.icon;
            return (
              <button
                key={r._id}
                type="button"
                onClick={() => setSelectedRecord(r)}
                className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-emerald-50/40 border border-emerald-300/30 text-left hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${meta.accent}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-emerald-900 truncate">
                      {r.reference || meta.label}
                    </p>
                    <p className="text-base text-emerald-700/65">
                      {r._type === "count"
                        ? r.rackScope === "all"
                          ? "All racks"
                          : `${r.racks?.length || 0} rack(s)`
                        : `${r.items?.length || 0} item(s)`}
                      {r.notes ? ` · ${r.notes}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-base font-bold uppercase px-2 py-1 rounded-full border ${meta.accent}`}>
                    {meta.label}
                  </span>
                  <span className={`text-base font-semibold capitalize ${
                    r.verification?.status === "verified"
                      ? "text-emerald-600"
                      : r.verification?.status === "rejected"
                        ? "text-rose-600"
                        : "text-amber-600"
                  }`}>
                    {r.verification?.status || "pending"} verification
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <StockMovementModal
        isOpen={isCreateOpen}
        initialType={createType}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(createdMovement) => {
          setIsCreateOpen(false);
          setReloadKey((k) => k + 1);
          if (createdMovement?._type || createType === "inbound" || createType === "outbound") {
            setReceiptRecord({ ...createdMovement, _type: createType });
          }
        }}
      />

      {receiptRecord && (
        <CashMemoModal
          order={receiptRecord}
          onClose={() => setReceiptRecord(null)}
        />
      )}

      <MovementDetailModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onEdit={handleEditFromDetail}
        onVerified={() => setReloadKey((k) => k + 1)}
      />

      <StockMovementModal
        isOpen={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onUpdated={() => {
          setEditRecord(null);
          setReloadKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default CargoMovementsPanel;