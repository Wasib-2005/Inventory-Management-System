import { useState } from "react";
import { FiCheck } from "react-icons/fi";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const TYPE_STYLES = {
  credit: "bg-rose-50 text-rose-600 border-rose-200",
  debt: "bg-amber-50 text-amber-600 border-amber-200",
};

const LedgerRow = ({ account }) => {
  const [payAmount, setPayAmount] = useState("");
  const [warehouseCredit, setWarehouseCredit] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const isCredit = account.type === "credit";

  const handleConfirm = () => {
    setIsConfirming(true);
    // TODO: wire to a real payment/settlement endpoint once it exists
    setTimeout(() => {
      setIsConfirming(false);
      setPayAmount("");
    }, 400);
  };

  return (
    <div className="p-3 border border-emerald-300/30 rounded-lg bg-emerald-50/40 flex flex-col gap-2 text-xs">
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-emerald-900 truncate">{account.customer}</h4>
          <span className="text-[10px] text-emerald-700/50">
            Limit: {currency}
            {account.limit.toLocaleString()}
          </span>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${TYPE_STYLES[account.type]}`}>
            {account.type}
          </span>
          <div>
            <span className="block font-black text-rose-600">
              {currency}
              {account.outstanding.toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                account.dueDate === "Overdue" ? "text-rose-500 font-bold" : "text-emerald-700/50"
              }`}
            >
              {account.dueDate}
            </span>
          </div>
        </div>
      </div>

      {isCredit && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-300/30">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder={`Pay amount (${currency})`}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
            {Number(payAmount) > 0 && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
              >
                <FiCheck size={12} />
                {isConfirming ? "..." : "Confirm"}
              </button>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700/60">
            <input
              type="checkbox"
              checked={warehouseCredit}
              onChange={(e) => setWarehouseCredit(e.target.checked)}
              className="accent-emerald-600"
            />
            Show warehouse credit
          </label>
          {warehouseCredit && (
            <p className="text-[10px] text-emerald-700/50 italic pl-5">
              {/* TODO: no warehouse-level credit schema yet — placeholder */}
              Warehouse credit breakdown isn't tracked yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CreditDebtFolder = ({ activeSub, ledger }) => {
  const filtered = activeSub === "all" ? ledger : ledger.filter((a) => a.type === activeSub);

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-emerald-900">Credit & Debt Ledger</h3>
        <p className="text-xs text-emerald-700/50 mt-0.5">
          Settle client invoices and track outstanding balances
        </p>
      </div>

      <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No accounts here</p>
        ) : (
          filtered.map((account) => <LedgerRow key={account.id} account={account} />)
        )}
      </div>
    </div>
  );
};

export default CreditDebtFolder;