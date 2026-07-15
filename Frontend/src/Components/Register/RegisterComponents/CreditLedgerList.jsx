const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const CreditLedgerList = ({ ledger }) => (
  <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
    {ledger.map((account) => (
      <div
        key={account.id}
        className="p-3 border border-emerald-300/30 rounded-lg bg-emerald-50/40 flex justify-between items-center text-xs gap-2"
      >
        <div className="min-w-0">
          <h4 className="font-bold text-emerald-900 truncate">{account.customer}</h4>
          <span className="text-[10px] text-emerald-700/50">
            Limit: {currency}
            {account.limit.toLocaleString()}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-black text-rose-600">
            {currency}
            {account.outstanding.toLocaleString()}
          </span>
          <span
            className={`text-[10px] font-semibold ${
              account.dueDate === "Overdue"
                ? "text-rose-500 font-bold"
                : "text-emerald-700/50"
            }`}
          >
            {account.dueDate}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default CreditLedgerList;
