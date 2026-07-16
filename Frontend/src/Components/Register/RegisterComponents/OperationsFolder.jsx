import ActionButton from "./ActionButton";
import { OPERATIONS_ACTIONS, SALE_STATUS_STYLES } from "./constants";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const OperationsFolder = ({ sales = [] }) => (
  <div className="flex flex-col gap-3">
    <div>
      <h3 className="text-sm font-bold text-emerald-900">Daily Activity Workflows</h3>
      <p className="text-xs text-emerald-700/50 mt-0.5">
        Manage live cargo & inventory movements
      </p>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {OPERATIONS_ACTIONS.map((action) => (
        <ActionButton key={action.label} {...action} />
      ))}
    </div>

    <div className="border-t border-emerald-300/30 pt-3">
      <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-1.5">
        Recent Sales
      </h4>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        {sales.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">
            No sales yet today
          </p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-emerald-900 truncate">
                  {sale.username}
                </p>
                <p className="text-[10px] font-mono text-emerald-700/50">
                  {sale.receipt}
                </p>
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
    </div>
  </div>
);

export default OperationsFolder;