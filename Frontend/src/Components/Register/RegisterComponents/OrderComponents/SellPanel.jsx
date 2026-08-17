import { useState } from "react";
import { HiClipboardDocument } from "react-icons/hi2";
import { FiMail, FiPhone, FiMapPin, FiUser, FiPackage, FiClock } from "react-icons/fi";
import LiveStatusBadge from "../LiveStatusBadge";
import { useOrderStream } from "../useOrderStream";
import { getPaymentDisplayStatus } from "../constants";
import OrderCreateModal from "./OrderCreateModal";
import OrderActionModal from "../OrderActionModal";
import OrderCard from "./OrderCard";
import { makeImageUrl } from "../../../../Service/auth/makeImageUrl";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

// Live-stream orders map to actionable cards (clickable, real _id, real
// due/total/return amounts, and the full customer/creator/product objects
// for the expandable detail panel and the product line items). Static mock
// `sales` rows stay display-only since there's no backend order behind them.

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
  // Backend now sends these directly on the order — prefer them over a
  // locally recomputed diff so the row always matches what was persisted.
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
    isPending: order.status === "pending",
    clickable: true,
    raw: { ...order, total, dueAmount },
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
      photoUrl: customer?.photoUrl || null,
      isGuest: !customer,
    },
    creatorDetails: {
      email: order.createdBy?.email || null,
      phone: order.createdBy?.phone || null,
      roleTitle: order.createdBy?.roleTitle || null,
      employeeId: order.createdBy?.employeeId || null,
      photoUrl: order.createdBy?.photoUrl || null,
    },
  };
};

const mapMockToRow = (s) => ({
  id: s.id,
  orderCode: s.receipt,
  username: s.username,
  email: null,
  createdBy: "—",
  productItems: [],
   createdAt: null,
  subtotal: s.boughtPrice + (s.discount || 0),
  discountAmount: s.discount || 0,
  discountPercent:
    s.boughtPrice + (s.discount || 0) > 0
      ? Math.round(
          ((s.discount || 0) / (s.boughtPrice + (s.discount || 0))) * 100,
        )
      : 0,
  total: s.boughtPrice,
  paidAmount: s.boughtPrice,
  dueAmount: 0,
  returnAmount: 0,
  status: s.status,
  orderStatus: null,
  isPending: false,
  clickable: false,
  raw: null,
  customerDetails: {
    email: null,
    phone: s.mobile || null,
    address: null,
    isGuest: true,
  },
  creatorDetails: {
    email: null,
    phone: null,
    roleTitle: null,
    employeeId: null,
  },
});

const InfoLine = ({ icon: Icon, children }) =>
  children ? (
    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700/60">
      <Icon size={11} className="shrink-0" />
      <span className="truncate">{children}</span>
    </p>
  ) : null;

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const DetailPanel = ({ sale }) => (
  <div className="p-5 bg-emerald-50/50 border-t border-emerald-300/30 text-left flex flex-col gap-4 mb-20">
    {/* Customer / Salesman */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-wide mb-1">
          Customer{" "}
          {sale.customerDetails.isGuest && (
            <span className="normal-case font-medium">(Guest — no account)</span>
          )}
        </p>
        <p className="text-xs font-semibold text-emerald-900 mb-0.5">
          {sale.username}
        </p>
        <InfoLine icon={FiMail}>{sale.customerDetails.email}</InfoLine>
        <InfoLine icon={FiPhone}>{sale.customerDetails.phone}</InfoLine>
        <InfoLine icon={FiMapPin}>{sale.customerDetails.address}</InfoLine>
        {!sale.customerDetails.email &&
          !sale.customerDetails.phone &&
          !sale.customerDetails.address && (
            <p className="text-[11px] text-emerald-700/40 italic">
              No contact details on file
            </p>
          )}
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

    {/* When */}
    <div className="flex items-center gap-1.5 text-[11px] border-t border-emerald-300/20 pt-3">
      <FiClock size={11} className="shrink-0 text-emerald-700/50" />
      <span className="font-bold text-emerald-700/50 uppercase tracking-wide">
        When
      </span>
      <span className="text-emerald-900 font-medium">
        {formatDateTime(sale.createdAt)}
      </span>
    </div>

    {/* Products */}
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
              <p className="text-[10px] text-emerald-700/50">x{p.qty}</p>
            </div>
            <span className="text-xs font-bold text-emerald-900 shrink-0">
              {currency}
              {(p.mrp * p.qty).toLocaleString()}
            </span>
          </div>
        ))}
        {(!sale.productItems || sale.productItems.length === 0) && (
          <span className="text-[11px] text-emerald-700/40 italic">
            No items
          </span>
        )}
      </div>
    </div>

    {/* Price breakdown */}
    <div className="border-t border-emerald-300/20 pt-3 flex flex-col  gap-1 ">
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
          className={`text-xs font-bold ${
            sale.returnAmount > 0
              ? "text-emerald-600"
              : sale.dueAmount > 0
                ? "text-rose-500"
                : "text-emerald-900"
          }`}
        >
          {sale.returnAmount > 0 ? "Return" : "Due"}
        </span>
        <span
          className={`text-xs font-bold ${
            sale.returnAmount > 0
              ? "text-emerald-600"
              : sale.dueAmount > 0
                ? "text-rose-500"
                : "text-emerald-900"
          }`}
        >
          {currency}
          {(sale.returnAmount > 0 ? sale.returnAmount : sale.dueAmount).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);

const SellPanel = ({ sales = [] }) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [actionOrder, setActionOrder] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const { status, orders, reconnect, updateOrder } = useOrderStream();

  const rows = [...orders.map(mapOrderToRow), ...sales.map(mapMockToRow)];

  const handleEditClick = (row) => {
    if (!row.clickable) return;
    setActionOrder(row.raw);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-emerald-900">
              Today's Sales
            </h3>
            <LiveStatusBadge status={status} onReconnect={reconnect} />
          </div>
          <p className="text-sm text-emerald-700/50 mt-0.5">
            Every order placed today, at a glance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <HiClipboardDocument size={16} />
          Make an Order
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-emerald-700/40 italic py-6 text-center">
          No sales yet today
        </p>
      ) : (
        <div className="rounded-xl border border-emerald-300/40 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-center text-sm whitespace-nowrap border-collapse">
              <thead className="bg-emerald-50/60 text-emerald-700/60 uppercase text-xs font-bold tracking-wider sticky top-0">
                <tr>
                  <th className="p-3 border border-emerald-300/40">Order ID</th>
                  <th className="p-3 border border-emerald-300/40">Customer</th>
                  <th className="p-3 border border-emerald-300/40">
                    Created By
                  </th>
                  <th className="p-3 border border-emerald-300/40">
                    Order Status
                  </th>
                  <th className="p-3 border border-emerald-300/40">
                    Payment Status
                  </th>
                  <th className="p-3 pr-4 border border-emerald-300/40">
                    Price
                  </th>
                  <th className="p-3 pr-4 text-right border border-emerald-300/40">
                    Edit
                  </th>
                  <th className="p-3 pl-4 w-8 border border-emerald-300/40"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((sale) => (
                  <>
                    <OrderCard
                      key={sale.id}
                      sale={sale}
                      isExpanded={expandedId === sale.id}
                      onToggleExpand={toggleExpand}
                      onEdit={handleEditClick}
                    />
                    {expandedId === sale.id && (
                      <tr key={`${sale.id}-detail`}>
                        <td colSpan={8} className="p-0">
                          <DetailPanel sale={sale} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderCreateModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onCreated={() => {
          // No manual refetch needed — the SSE stream already pushes the
          // new order in as soon as the backend broadcasts it.
        }}
      />

      {actionOrder && (
        <OrderActionModal
          order={actionOrder}
          onClose={() => setActionOrder(null)}
          onUpdated={updateOrder}
        />
      )}
    </div>
  );
};

export default SellPanel;
