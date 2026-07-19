import { useState } from "react";
import { HiClipboardDocument } from "react-icons/hi2";
import OrderCreateModal from "./OrderComponents/OrderCreateModal";
import { SALE_STATUS_STYLES } from "./constants";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const SellPanel = ({ sales = [] }) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Today's Sales</h3>
          <p className="text-xs text-emerald-700/50 mt-0.5">
            Every order placed today, at a glance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-3 py-2 rounded-lg transition-colors shrink-0"
        >
          <HiClipboardDocument size={14} />
          Make an Order
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto pr-1">
        {sales.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No sales yet today</p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-emerald-900 truncate">
                  {sale.username}
                </p>
                <p className="text-[10px] font-mono text-emerald-700/50">{sale.receipt}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-bold text-emerald-900">
                  {currency}
                  {sale.boughtPrice.toLocaleString()}
                </p>
                <span
                  className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                    SALE_STATUS_STYLES[sale.status] || SALE_STATUS_STYLES.Partial
                  }`}
                >
                  {sale.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <OrderCreateModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onCreated={() => {
          // TODO: once /api/order/get is real, refetch/append to the sales list here
        }}
      />
    </div>
  );
};

export default SellPanel;