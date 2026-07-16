import { FiTrendingUp, FiPercent, FiAlertCircle } from "react-icons/fi";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const StatsBar = ({ sales, creditLedger }) => {
  const totalSales = sales.reduce((sum, s) => sum + s.boughtPrice, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalOutstanding = creditLedger.reduce(
    (sum, c) => sum + c.outstanding,
    0,
  );

  const stats = [
    {
      label: "Today's Sales",
      value: `${currency}${totalSales.toLocaleString()}`,
      icon: FiTrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Discounts Given",
      value: `${currency}${totalDiscount.toLocaleString()}`,
      icon: FiPercent,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Outstanding Credit",
      value: `${currency}${totalOutstanding.toLocaleString()}`,
      icon: FiAlertCircle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur border border-emerald-300/40 shadow-sm"
        >
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${stat.color}`}
          >
            <stat.icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/50">
              {stat.label}
            </p>
            <p className="text-lg font-extrabold text-emerald-900 truncate">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
