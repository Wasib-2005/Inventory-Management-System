import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiClock,
  FiPackage,
} from "react-icons/fi";
import { getPaymentDisplayStatus } from "../constants";
import { makeImageUrl } from "../../../../Service/auth/makeImageUrl";


const currency = import.meta.env.VITE_CURRENCY_SYMBOL;
const PAGE_SIZE = 10;

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const mapOrderToRow = (order) => {
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0),
    0,
  );
  const discountAmount = Number(order.payment?.discountAmount) || 0;
  const discountPercent =
    subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
  const total = Math.max(subtotal - discountAmount, 0);
  const paidAmount = Number(order.payment?.paidAmount) || 0;
  const dueAmount = Number(order.dueAmount) || 0;
  const returnAmount = Number(order.returnAmount) || 0;

  const customer = order.customerId || null;
  const guest = order.guestCustomer || null;

  const productItems = items.map((item) => ({
    id: item._id,
    name: item.product?.name || "Unknown product",
    brand: item.product?.brand || "",
    image: item.product?.image?.header || "",
    qty: Number(item.qty) || 0,
    mrp: Number(item.product?.pricing?.mrp ?? item.price) || 0,
  }));

  return {
    id: order._id,
    orderCode: order._id
      ? `#${String(order._id).slice(-6).toUpperCase()}`
      : "—",
    username:
      customer?.displayName ||
      customer?.username ||
      guest?.username ||
      "Walk-in",
    email: customer?.email || guest?.email || null,
    createdBy:
      order.createdBy?.displayName || order.createdBy?.username || "Unknown",
    productItems,
    subtotal,
    createdAt: order.createdAt,
    discountAmount,
    discountPercent,
    total,
    paidAmount,
    dueAmount,
    returnAmount,
    status: order.payment?.status
      ? order.payment.status.charAt(0).toUpperCase() +
        order.payment.status.slice(1)
      : getPaymentDisplayStatus(paidAmount, total),
    orderStatus: order.status,
    customerDetails: {
      email: customer?.email || guest?.email || null,
      phone: customer?.phone || guest?.mobile || null,
      address: customer?.address
        ? [
            customer.address.street,
            customer.address.city,
            customer.address.country,
          ]
            .filter(Boolean)
            .join(", ")
        : guest?.address || null,
      isGuest: !customer,
    },
    creatorDetails: {
      email: order.createdBy?.email || null,
      phone: order.createdBy?.phone || null,
      roleTitle: order.createdBy?.roleTitle || null,
      employeeId: order.createdBy?.employeeId || null,
    },
  };
};

const InfoLine = ({ icon: Icon, children }) =>
  children ? (
    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700/60">
      <Icon size={11} className="shrink-0" />
      <span className="truncate">{children}</span>
    </p>
  ) : null;

const DetailPanel = ({ sale }) => (
  <div className="p-5 bg-emerald-50/50 border-t border-emerald-300/30 text-left flex flex-col gap-4 mb-20">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-wide mb-1">
          Customer{" "}
          {sale.customerDetails.isGuest && (
            <span className="normal-case font-medium">
              (Guest — no account)
            </span>
          )}
        </p>
        <p className="text-xs font-semibold text-emerald-900 mb-0.5">
          {sale.username}
        </p>
        <InfoLine icon={FiMail}>{sale.customerDetails.email}</InfoLine>
        <InfoLine icon={FiPhone}>{sale.customerDetails.phone}</InfoLine>
        <InfoLine icon={FiMapPin}>{sale.customerDetails.address}</InfoLine>
      </div>
      <div>
        <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-wide mb-1">
          Salesman
        </p>
        <p className="text-xs font-semibold text-emerald-900 mb-0.5">
          {sale.createdBy}
          {sale.creatorDetails.roleTitle && (
            <span className="font-medium text-emerald-700/50">
              {" "}
              · {sale.creatorDetails.roleTitle}
            </span>
          )}
        </p>
        <InfoLine icon={FiUser}>
          {sale.creatorDetails.employeeId
            ? `ID: ${sale.creatorDetails.employeeId}`
            : null}
        </InfoLine>
        <InfoLine icon={FiMail}>{sale.creatorDetails.email}</InfoLine>
        <InfoLine icon={FiPhone}>{sale.creatorDetails.phone}</InfoLine>
      </div>
    </div>

    <div className="flex items-center gap-1.5 text-[11px] border-t border-emerald-300/20 pt-3">
      <FiClock size={11} className="shrink-0 text-emerald-700/50" />
      <span className="font-bold text-emerald-700/50 uppercase tracking-wide">
        When
      </span>
      <span className="text-emerald-900 font-medium">
        {formatDateTime(sale.createdAt)}
      </span>
    </div>

    <div className="border-t border-emerald-300/20 pt-3">
      <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-wide mb-2">
        Products
      </p>
      <div className="flex flex-col gap-2">
        {(sale.productItems || []).map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            {p.image ? (
              <img
                src={makeImageUrl(p.image)}
                alt={p.name}
                className="w-8 h-8 rounded-md object-cover border border-emerald-200 bg-white shrink-0"
                onError={(e) => (e.target.style.visibility = "hidden")}
              />
            ) : (
              <div className="w-8 h-8 rounded-md border border-emerald-200 bg-emerald-50 flex items-center justify-center shrink-0">
                <FiPackage size={14} className="text-emerald-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-900 truncate">
                {p.name}
                {p.brand && (
                  <span className="text-emerald-700/50 font-normal">
                    {" "}
                    ({p.brand})
                  </span>
                )}
              </p>
              <p className="text-[10px] text-emerald-700/50">x{Number(p.qty || 0).toLocaleString()}</p>
            </div>
            <span className="text-xs font-bold text-emerald-900 shrink-0">
              {currency}
              {(p.mrp * p.qty).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-emerald-300/20 pt-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-emerald-700/60">Subtotal</span>
        <span className="text-xs font-medium text-emerald-900">
          {currency}
          {sale.subtotal.toLocaleString()}
        </span>
      </div>
      {sale.discountAmount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-700/60">
            Discount ({sale.discountPercent}%)
          </span>
          <span className="text-xs font-medium text-rose-500">
            -{currency}
            {sale.discountAmount.toLocaleString()}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-emerald-300/20 pt-1.5 mt-0.5">
        <span className="text-xs font-bold text-emerald-900">Total</span>
        <span className="text-xs font-bold text-emerald-900">
          {currency}
          {sale.total.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-emerald-700/60">Paid Amount</span>
        <span className="text-xs font-medium text-emerald-900">
          {currency}
          {sale.paidAmount.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-emerald-300/20 pt-1.5 mt-0.5">
        <span
          className={`text-xs font-bold ${sale.returnAmount > 0 ? "text-emerald-600" : sale.dueAmount > 0 ? "text-rose-500" : "text-emerald-900"}`}
        >
          {sale.returnAmount > 0 ? "Return" : "Due"}
        </span>
        <span
          className={`text-xs font-bold ${sale.returnAmount > 0 ? "text-emerald-600" : sale.dueAmount > 0 ? "text-rose-500" : "text-emerald-900"}`}
        >
          {currency}
          {(sale.returnAmount > 0
            ? sale.returnAmount
            : sale.dueAmount
          ).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);

const OpenAllOrderModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState("day");
  const [date, setDate] = useState(todayISO());
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    setExpandedId(null);
  }, [period, date]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    axios
      .get(`${import.meta.env.VITE_BACKEND_API_HEADER}/api/order/all-order`, {
        withCredentials: true,
        params: { period, date, page, limit: PAGE_SIZE },
        signal: controller.signal,
      })
      .then((res) => {
        const newOrders = res.data?.data || [];
        const paginationInfo = res.data?.pagination;

        setOrders((prev) => (page === 1 ? newOrders : [...prev, ...newOrders]));
        if (paginationInfo) {
          setTotal(paginationInfo.total);
          setHasMore(page < paginationInfo.totalPages);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.message || "Could not load orders");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [period, date, page]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  const rows = orders.map(mapOrderToRow);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <h3 className="font-bold text-emerald-900 text-sm">All Orders</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-emerald-300/30">
          <div className="flex rounded-lg border border-emerald-300/40 overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  period === p.key
                    ? "bg-[#1D9E75] text-white"
                    : "bg-white text-emerald-700/60 hover:bg-emerald-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300/40 text-emerald-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
          <span className="text-[11px] text-emerald-700/50 ml-auto">
            {total} order{total === 1 ? "" : "s"}
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto mx-5 pb-5">
          {error ? (
            <p className="text-sm text-rose-600 font-semibold py-10 text-center">
              {error}
            </p>
          ) : rows.length === 0 && !loading ? (
            <p className="text-sm text-emerald-700/40 italic py-10 text-center">
              No orders in this range
            </p>
          ) : (
            <table className="w-full text-center text-sm whitespace-nowrap border-collapse mt-3">
              <thead className="bg-emerald-50 text-emerald-700/60 uppercase text-xs font-bold tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3 border border-emerald-300/40">Order ID</th>
                  <th className="p-3 border border-emerald-300/40">Customer</th>
                  <th className="p-3 border border-emerald-300/40">Status</th>
                  <th className="p-3 border border-emerald-300/40">Payment</th>
                  <th className="p-3 border border-emerald-300/40">Total</th>
                  <th className="p-3 border border-emerald-300/40">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === row.id ? null : row.id,
                        )
                      }
                      className="border-b border-emerald-300/20 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="p-3 border border-emerald-300/40 font-bold text-emerald-900">
                        {row.orderCode}
                      </td>
                      <td className="p-3 border border-emerald-300/40 text-emerald-700/70">
                        {row.username}
                      </td>
                      <td className="p-3 border border-emerald-300/40 text-emerald-700/70">
                        {row.orderStatus || "—"}
                      </td>
                      <td className="p-3 border border-emerald-300/40 text-emerald-700/70">
                        {row.status}
                      </td>
                      <td className="p-3 border border-emerald-300/40 font-semibold text-emerald-900">
                        {currency}
                        {row.total.toLocaleString()}
                      </td>
                      <td className="p-3 border border-emerald-300/40 text-emerald-700/60">
                        {formatDateTime(row.createdAt)}
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <DetailPanel sale={row} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}

          {loading && (
            <p className="text-xs text-emerald-700/50 italic py-4 text-center">
              Loading more orders...
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default OpenAllOrderModal;
