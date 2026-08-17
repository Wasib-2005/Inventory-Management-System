import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { completeOrder, payOrder } from "./api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

// Opened when an order row is clicked and the order is either still
// "pending" or has money left to pay (dueAmount > 0).
const OrderActionModal = ({ order, onClose, onUpdated }) => {
  const dueAmount = Math.max(Number(order.dueAmount) || 0, 0);
  const total = order.total ?? Number(order.payment?.paidAmount || 0) + dueAmount;
  const paidSoFar = Number(order.payment?.paidAmount) || 0;
  const items = order.items || order.products || [];

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const entered = Number(amount) || 0;
  const change = Math.max(entered - dueAmount, 0);
  const remaining = Math.max(dueAmount - entered, 0);

  // Nothing owed -> this is a plain confirm. Something owed -> button
  // reflects whether the entered amount clears the due or is partial.
  const buttonLabel =
    dueAmount <= 0
      ? "Confirm Order"
      : entered <= 0
      ? "Enter Amount"
      : entered >= dueAmount
      ? "Confirm & Complete"
      : `Collect ${currency}${entered.toLocaleString()}`;

  const canSubmit = dueAmount <= 0 || entered > 0;

  const handleSubmit = async () => {
    setError("");

    if (dueAmount <= 0) {
      setIsSubmitting(true);
      try {
        const completeRes = await completeOrder(order._id);
        onUpdated(order._id, {
          status: completeRes.data?.data?.status || "complete",
        });
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || "Could not confirm order");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (entered <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const payRes = await payOrder(order._id, {
        paidAmount: entered,
        status: entered >= dueAmount ? "paid" : "due",
      });
      const updatedPaid = payRes.data?.data?.payment?.paidAmount ?? paidSoFar + entered;
      const stillDue = Math.max(total - updatedPaid, 0);

      let nextStatus = order.status;
      if (stillDue <= 0) {
        const completeRes = await completeOrder(order._id);
        nextStatus = completeRes.data?.data?.status || "complete";
      }

      onUpdated(order._id, {
        payment: {
          ...order.payment,
          paidAmount: updatedPaid,
          status: stillDue <= 0 ? "paid" : "due",
        },
        dueAmount: stillDue,
        status: nextStatus,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <h3 className="font-bold text-emerald-900 text-sm">
            {dueAmount > 0 ? "Collect Payment" : "Confirm Order"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Selected products */}
          {items.length > 0 && (
            <div className="flex flex-col gap-1.5 pb-3 border-b border-emerald-300/30">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700/60 uppercase">
                <FiPackage size={11} /> Items
              </span>
              {items.map((item, i) => (
                <div
                  key={item._id || i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-emerald-900 font-medium truncate pr-2">
                    {item.name || item.product?.name} × {item.quantity || item.qty}
                  </span>
                  <span className="text-emerald-700/70 font-semibold shrink-0">
                    {currency}
                    {(Number(item.price) * Number(item.quantity || item.qty || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700/60 font-semibold">Total</span>
            <span className="font-bold text-emerald-900">
              {currency}
              {total.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700/60 font-semibold">
              Paid so far
            </span>
            <span className="font-bold text-emerald-900">
              {currency}
              {paidSoFar.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-300/30">
            <span className="text-rose-600 font-semibold">Due</span>
            <span className="font-black text-rose-600">
              {currency}
              {dueAmount.toLocaleString()}
            </span>
          </div>

          {dueAmount > 0 && (
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-blue-700/70 uppercase mb-1">
                  Amount Received ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  className="w-full text-sm px-3 py-2 rounded-lg border border-blue-300/60 bg-blue-50/30 text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </div>

              {entered > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-1 text-xs">
                  {change > 0 ? (
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <span>Return / Change:</span>
                      <span className="text-sm text-emerald-700 font-extrabold">
                        {currency}
                        {change.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : remaining > 0 ? (
                    <div className="flex items-center justify-between text-amber-800 font-semibold">
                      <span>Remaining Balance:</span>
                      <span className="font-bold">
                        {currency}
                        {remaining.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-emerald-800 font-semibold">
                      <span>Status:</span>
                      <span className="font-bold">Exact Payment</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
              <FiAlertTriangle size={12} className="shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default OrderActionModal;