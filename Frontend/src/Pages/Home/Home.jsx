import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
} from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  Tag,
  ListFilter,
  ExternalLink,
  User,
} from "lucide-react";
import OpenAllOrderModal from "../../Components/Register/RegisterComponents/OrderComponents/OpenAllOrderModal";

// Environment Variables
const APP_NAME = import.meta.env.VITE_APP_NAME || "Inventra";
const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || "৳";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_API_HEADER || "https://localhost:5000";

const fmtCurrency = (num) =>
  `${CURRENCY_SYMBOL}${(num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const fmtNumber = (num) => Number(num || 0).toLocaleString();

const fmtCompactNumber = (value) => {
  const number = Number(value || 0);
  const absolute = Math.abs(number);
  if (absolute >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (absolute >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (absolute >= 1_000) return `${(number / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return number.toLocaleString();
};

const getCustomerName = (order) => {
  if (order.customerId && order.customerId.username)
    return order.customerId.username;
  if (order.guestCustomer && order.guestCustomer.username)
    return `${order.guestCustomer.username} (Guest)`;
  return "Walk-in Customer";
};

const getItemName = (item) => {
  if (!item) return "Unknown Item";
  if (item.product && typeof item.product === "object" && item.product.name) {
    return item.product.name;
  }
  return "Unspecified Item";
};

const computeOrderMetrics = (order) => {
  if (!order)
    return { grossTotal: 0, discount: 0, paid: 0, due: 0, totalQty: 0 };

  let grossTotal = 0;
  let totalQty = 0;

  if (Array.isArray(order.items)) {
    grossTotal = order.items.reduce((sum, item) => {
      const q = item.qty || 1;
      totalQty += q;
      return sum + (item.price || 0) * q;
    }, 0);
  }

  const discount = order.payment?.discountAmount || 0;
  const paid = order.payment?.paidAmount || 0;
  const due = order.dueAmount ?? Math.max(0, grossTotal - discount - paid);

  return { grossTotal, discount, paid, due, totalQty };
};

/* ---------------- SSE CUSTOM HOOK ---------------- */
function useSseDashboard(period) {
  const [data, setData] = useState({
    metrics: {
      grossTotal: 0,
      totalPaid: 0,
      totalDiscount: 0,
      totalDueLeft: 0,
      totalOrders: 0,
      fullyPaidCount: 0,
      pendingDueCount: 0,
    },
    stockMetrics: { inbound: 0, outbound: 0 },
    salesChart: [],
    movementChart: [],
    recentOrders: [],
  });

  const [status, setStatus] = useState("connecting");
  const [flashIds, setFlashIds] = useState(() => new Set());
  const esRef = useRef(null);
  const flashTimeoutsRef = useRef(new Map());

  const triggerFlash = useCallback((id) => {
    const previousTimeout = flashTimeoutsRef.current.get(id);
    if (previousTimeout) clearTimeout(previousTimeout);

    setFlashIds((prev) => new Set(prev).add(id));
    const timeout = setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      flashTimeoutsRef.current.delete(id);
    }, 2500);
    flashTimeoutsRef.current.set(id, timeout);
  }, []);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    flashTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    flashTimeoutsRef.current.clear();
    setStatus("disconnected");
  }, []);

  const connect = useCallback(() => {
    disconnect();
    setStatus("connecting");

    try {
      const endpointUrl = `${BACKEND_URL}/api/dashboard/get?period=${period}`;
      const es = new EventSource(endpointUrl, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => setStatus("connected");

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === "INIT") {
            setData({
              metrics: payload.metrics,
              stockMetrics: payload.stockMetrics,
              salesChart: payload.salesChart,
              movementChart: payload.movementChart,
              recentOrders: payload.recentOrders,
            });
          } else if (payload.type === "NEW_ORDER") {
            const newOrder = payload.data || payload.orderData;
            if (newOrder) {
              const { grossTotal, paid, discount, due } =
                computeOrderMetrics(newOrder);

              setData((prev) => ({
                ...prev,
                recentOrders: [newOrder, ...prev.recentOrders.slice(0, 14)],
                metrics: {
                  ...prev.metrics,
                  grossTotal: prev.metrics.grossTotal + grossTotal,
                  totalPaid: prev.metrics.totalPaid + paid,
                  totalDiscount: prev.metrics.totalDiscount + discount,
                  totalDueLeft: prev.metrics.totalDueLeft + due,
                  totalOrders: prev.metrics.totalOrders + 1,
                  fullyPaidCount:
                    due <= 0
                      ? prev.metrics.fullyPaidCount + 1
                      : prev.metrics.fullyPaidCount,
                  pendingDueCount:
                    due > 0
                      ? prev.metrics.pendingDueCount + 1
                      : prev.metrics.pendingDueCount,
                },
              }));
              triggerFlash(newOrder._id);
            }
          }
        } catch (err) {
          console.error("Error parsing SSE JSON:", err);
        }
      };

      es.onerror = () => {
        setStatus("error");
        disconnect();
      };
    } catch (err) {
      setStatus("error");
    }
  }, [period, disconnect, triggerFlash]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { ...data, status, flashIds, connect, disconnect };
}

/* ---------------- MAIN DASHBOARD ---------------- */
export default function LiveDashboard() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAllOrdersOpen, setIsAllOrdersOpen] = useState(false);

  const [period, setPeriod] = useState(() => {
    return localStorage.getItem("dash_universal_period") || "month";
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    localStorage.setItem("dash_universal_period", newPeriod);
  };

  const {
    metrics,
    stockMetrics,
    salesChart,
    movementChart,
    recentOrders,
    status,
    flashIds,
    connect,
    disconnect,
  } = useSseDashboard(period);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const normalizedStatus = statusFilter.toLowerCase();

    return recentOrders.filter((o) => {
      const customerName = getCustomerName(o).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        o._id?.toLowerCase().includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        o.items?.some((i) =>
          getItemName(i).toLowerCase().includes(normalizedSearch),
        );

      const matchesStatus =
        statusFilter === "All" ||
        o.status?.toLowerCase() === normalizedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [recentOrders, deferredSearch, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 text-slate-800 font-sans p-2 sm:p-4">
      {/* ---------------- CONTROL BAR ---------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {APP_NAME} Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Real-time analytics and dynamic database streaming
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setIsAllOrdersOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ListFilter size={15} className="text-indigo-600" />
            <span>All Orders</span>
            <ExternalLink size={12} className="opacity-60" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
            <Calendar
              size={14}
              className="text-indigo-600 shrink-0 hidden sm:inline"
            />
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
              {["day", "week", "month", "year"].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer ${
                    period === p
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                status === "connected"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : status === "connecting"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-current"
                }`}
              />
              <span className="capitalize">{status}</span>
            </div>

            {status === "connected" ? (
              <button
                onClick={disconnect}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw
                  size={12}
                  className={status === "connecting" ? "animate-spin" : ""}
                />
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- KPI METRICS CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gross Sales
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">
            {fmtCurrency(metrics.grossTotal)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {fmtNumber(metrics.totalOrders)} order(s) ({period})
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Total Paid
            </p>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-600">
            {fmtCurrency(metrics.totalPaid)}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {fmtNumber(metrics.fullyPaidCount)} order(s) fully paid
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Due Left
            </p>
            <AlertCircle size={18} className="text-rose-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-600">
            {fmtCurrency(metrics.totalDueLeft)}
          </p>
          <p className="text-[11px] text-rose-700 font-semibold">
            {fmtNumber(metrics.pendingDueCount)} pending payment
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Total Discount
            </p>
            <Tag size={18} className="text-purple-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-purple-600">
            {fmtCurrency(metrics.totalDiscount)}
          </p>
          <p className="text-[11px] text-purple-700 font-semibold">
            Applied discounts
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Stock Activity
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              <ArrowDownLeft size={14} /> {fmtNumber(stockMetrics.inbound)} In
            </span>
            <span className="text-xs font-bold flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <ArrowUpRight size={14} /> {fmtNumber(stockMetrics.outbound)} Out
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- DUAL GRAPHS SECTION ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* ---------------- SALES TREND CHART ---------------- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Sales Trend ({period})
            </h2>
            <p className="text-xs text-slate-500">
              Gross vs Paid Amount vs Discounts
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" fontSize={10} />
                <YAxis fontSize={10} tickFormatter={fmtCompactNumber} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold border-b pb-1 text-slate-800">
                            {label}
                          </p>
                          <p className="text-blue-600 font-semibold">
                            Gross: {fmtCurrency(d.grossTotal)}
                          </p>
                          <p className="text-purple-600 font-semibold">
                            Discount: {fmtCurrency(d.discount)}
                          </p>
                          <p className="text-emerald-600 font-semibold">
                            Paid: {fmtCurrency(d.paidAmount)}
                          </p>
                          <p className="text-rose-600 font-semibold">
                            Due: {fmtCurrency(d.dueAmount)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  iconSize={10}
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Area
                  type="monotone"
                  dataKey="grossTotal"
                  name="Gross Sales"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#grossGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="paidAmount"
                  name="Paid Amount"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#paidGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------- STOCK MOVEMENT CHART ---------------- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-500" />
              Stock Movement Activity ({period})
            </h2>
            <p className="text-xs text-slate-500">
              Inbound vs Outbound inventory transfers
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" fontSize={10} />
                <YAxis fontSize={10} tickFormatter={fmtCompactNumber} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold border-b pb-1 text-slate-800">
                            {label}
                          </p>
                          <p className="text-blue-600 font-semibold">
                            Inbound: {fmtNumber(d.inbound)}
                          </p>
                          <p className="text-indigo-600 font-semibold">
                            Outbound: {fmtNumber(d.outbound)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  iconSize={10}
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Bar
                  dataKey="inbound"
                  name="Inbound Stock"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="outbound"
                  name="Outbound Stock"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ---------------- LIVE ORDERS TABLE ---------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Recent Orders ({filteredOrders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Showing top 15 recent orders in real-time
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search order or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-48 lg:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-semibold bg-white cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirm">Confirmed</option>
              <option value="complete">Complete</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Items</th>
                <th className="py-3 px-2">Gross Total</th>
                <th className="py-3 px-2">Paid</th>
                <th className="py-3 px-2">Due Left</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-slate-400 font-medium"
                  >
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { grossTotal, discount, paid, due } =
                    computeOrderMetrics(order);
                  const isFlashed = flashIds.has(order._id);
                  const items = order.items || [];

                  return (
                    <tr
                      key={order._id}
                      className={`transition-colors ${
                        isFlashed
                          ? "bg-amber-100 animate-pulse"
                          : "hover:bg-slate-50/80 text-slate-700"
                      }`}
                    >
                      <td className="py-3 px-2 font-mono text-[11px] font-bold text-indigo-600 align-top">
                        {order._id ? `#${order._id.substring(0, 8)}` : "N/A"}
                      </td>

                      <td className="py-3 px-2 align-top">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {getCustomerName(order)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2 align-top">
                        <div className="space-y-1">
                          {items.length === 0 ? (
                            <span className="text-slate-400">No items</span>
                          ) : (
                            items.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-slate-900 font-medium gap-2"
                              >
                                <span className="truncate max-w-[130px]">
                                  {getItemName(it)}
                                </span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {fmtNumber(it.qty || 1)} × {fmtCurrency(it.price || 0)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-2 font-bold text-slate-900 align-top">
                        {fmtCurrency(grossTotal)}
                        {discount > 0 && (
                          <div className="text-[10px] text-purple-600 font-normal">
                            Disc: {fmtCurrency(discount)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-2 font-bold text-emerald-600 align-top">
                        {fmtCurrency(paid)}
                      </td>

                      <td className="py-3 px-2 font-bold text-rose-600 align-top">
                        {due > 0 ? fmtCurrency(due) : `${CURRENCY_SYMBOL}0`}
                      </td>

                      <td className="py-3 px-2 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            order.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : order.status === "confirm"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : order.status === "delivered"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OpenAllOrderModal
        isOpen={isAllOrdersOpen}
        onClose={() => setIsAllOrdersOpen(false)}
      />
    </div>
  );
}
