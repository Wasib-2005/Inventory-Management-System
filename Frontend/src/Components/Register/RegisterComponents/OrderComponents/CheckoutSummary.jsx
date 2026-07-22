import { useEffect } from "react";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

// Rounds up away from zero so floating point remainders (e.g. 1.0000000001
// from a /100*100 round trip) always resolve to the next whole number
// instead of silently truncating down to 1.
const roundUp = (value) => Math.ceil(Number(value) || 0);

const STATUS_BADGE_STYLES = {
  Paid: "bg-emerald-600 text-white",
  Due: "bg-rose-600 text-white",
};

const CheckoutSummary = ({
  subtotal,
  discount,
  onDiscountChange,
  paymentStatus,
  onPaymentStatusChange,
  payAmount,
  onPayAmountChange,
}) => {
  // Discount amount is the single source of truth; percent is always
  // derived from it (and rounded up) so the two fields never drift apart.
  const discountAmount = Math.min(Math.max(roundUp(discount), 0), subtotal || 0);
  const discountPercent =
    subtotal > 0 ? roundUp((discountAmount / subtotal) * 100) : 0;
  const total = Math.max(subtotal - discountAmount, 0);

  const handleAmountInput = (value) => {
    const amt = Math.min(Math.max(roundUp(value), 0), subtotal || 0);
    onDiscountChange(amt);
  };

  const handlePercentInput = (value) => {
    const pct = Math.min(Math.max(roundUp(value), 0), 100);
    const amt = Math.min(roundUp((pct / 100) * subtotal), subtotal || 0);
    onDiscountChange(amt);
  };

  // Pay / Return — like a POS: cash tendered vs. change owed back.
  const paid = Math.max(Number(payAmount) || 0, 0);
  const diff = paid - total;
  const isShort = diff < 0;
  const returnAmount = Math.max(diff, 0);
  const dueAmount = Math.max(-diff, 0);

  // Payment status is fully derived from the amount paid vs. the total:
  // pay in full (or more) -> Paid. Pay less (or nothing) -> Due.
  const derivedStatus = paid >= total ? "Paid" : "Due";

  useEffect(() => {
    if (derivedStatus !== paymentStatus) {
      onPaymentStatusChange(derivedStatus);
    }
  }, [derivedStatus, paymentStatus, onPaymentStatusChange]);

  return (
    <div className="border-t border-emerald-300/30 pt-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-700/60">Subtotal</span>
        <span className="text-sm font-semibold text-emerald-900">
          {currency}
          {subtotal.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-rose-700/60 uppercase mb-1">
            Discount ({currency})
          </label>
          <input
            type="number"
            min={0}
            max={subtotal}
            value={discountAmount}
            onChange={(e) => handleAmountInput(e.target.value)}
            className="w-full text-sm px-3 py-1.5 rounded-lg border border-rose-300/60 bg-rose-50/40 text-rose-900 font-semibold text-right focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-rose-700/60 uppercase mb-1">
            Discount (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => handlePercentInput(e.target.value)}
              className="w-full text-sm pl-3 pr-6 py-1.5 rounded-lg border border-rose-300/60 bg-rose-50/40 text-rose-900 font-semibold text-right focus:outline-none focus:ring-2 focus:ring-rose-400/40"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-700/50">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-emerald-900">Total</span>
        <span className="text-lg font-extrabold text-emerald-900">
          {currency}
          {total.toLocaleString()}
        </span>
      </div>

      {/* Pay / Return - cash tendered vs. change owed, POS-style */}
      <div className="rounded-lg border border-blue-300/50 bg-blue-50/40 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-bold text-blue-700/70 uppercase shrink-0">
            Pay
          </label>
          <input
            type="number"
            min={0}
            value={payAmount}
            onChange={(e) => onPayAmountChange(e.target.value)}
            placeholder="0"
            className="w-32 text-sm px-3 py-1.5 rounded-lg border border-blue-300/60 bg-white text-blue-900 font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          />
        </div>

        <div className="flex items-center justify-between border-t border-blue-300/30 pt-2">
          <span
            className={`text-xs font-bold uppercase ${
              isShort ? "text-amber-700/70" : "text-emerald-700/70"
            }`}
          >
            {isShort ? "Due" : "Return"}
          </span>
          <span
            className={`text-base font-black ${
              isShort ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {currency}
            {(isShort ? dueAmount : returnAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Status - derived automatically from Pay vs. Total above */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-emerald-700/60 uppercase">
          Payment Status
        </span>
        <span
          className={`text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full ${STATUS_BADGE_STYLES[derivedStatus]}`}
        >
          {derivedStatus}
        </span>
      </div>
    </div>
  );
};

export default CheckoutSummary;