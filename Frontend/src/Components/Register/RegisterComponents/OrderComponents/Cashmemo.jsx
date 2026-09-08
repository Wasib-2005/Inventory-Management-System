import { QRCodeSVG } from "qrcode.react";
import Barcode from "./Barcode";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;
const APP_NAME = import.meta.env.VITE_APP_NAME || "Store";

const formatDateTime = (dateString) => {
  const d = dateString ? new Date(dateString) : new Date();
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Same derivation logic as SellPanel's mapOrderToRow, so the receipt
// always agrees with what's shown in the order list — works whether it's
// handed a freshly-created order (from createOrder's response) or one
// patched locally after a payment/confirm action.
const deriveReceipt = (order) => {
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      (Number(i.qty) || 0) * (Number(i.price ?? i.product?.pricing?.mrp) || 0),
    0,
  );
  const discountAmount = Number(order.payment?.discountAmount) || 0;
  const discountPercent =
    subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
  const total = order.total ?? Math.max(subtotal - discountAmount, 0);
  const paidAmount = Number(order.payment?.paidAmount) || 0;
  const dueAmount = Math.max(Number(order.dueAmount) || 0, 0);
  const returnAmount = Math.max(Number(order.returnAmount) || 0, 0);

  const customer = order.customerId || null;
  const guest = order.guestCustomer || null;

  return {
    orderId: order._id || "",
    createdAt: order.createdAt,
    customerName:
      customer?.displayName ||
      customer?.username ||
      guest?.username ||
      order.username ||
      "Walk-in",
    customerEmail: customer?.email || guest?.email || order.email || "",
    customerPhone: customer?.phone || guest?.mobile || order.mobile || "",
    salesmanName:
      order.createdBy?.displayName || order.createdBy?.username || "—",
    salesmanEmail: order.createdBy?.email || "",
    items: items.map((item) => ({
      name: item.product?.name || item.name || "Item",
      qty: Number(item.qty) || 0,
      price: Number(item.price ?? item.product?.pricing?.mrp) || 0,
    })),
    subtotal,
    discountAmount,
    discountPercent,
    total,
    paidAmount,
    dueAmount,
    returnAmount,
  };
};

// The printable content. Rendered inline (for the on-screen preview) and
// is what @media print isolates and prints via CashMemoModal — this
// component itself carries the #cash-memo-print id that the print CSS
// targets, so it needs to stay the outermost element whenever it's used.
const CashMemo = ({ order }) => {
  const r = deriveReceipt(order);

  // QR encodes the full receipt data, not just the ID, per your request.
  const qrPayload = JSON.stringify({
    orderId: r.orderId,
    date: r.createdAt,
    customer: {
      name: r.customerName,
      email: r.customerEmail,
      phone: r.customerPhone,
    },
    salesman: r.salesmanName,
    items: r.items,
    subtotal: r.subtotal,
    discount: r.discountAmount,
    total: r.total,
    paid: r.paidAmount,
    due: r.dueAmount,
    return: r.returnAmount,
  });

  return (
    <div
      id="cash-memo-print"
      className="bg-white text-black w-full max-w-xl mx-auto p-6 flex flex-col gap-4 font-sans"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            className="w-10 h-10 object-contain"
            onError={(e) => (e.target.style.display = "none")}
          />
          <span className="text-lg font-black tracking-tight">{APP_NAME}</span>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold uppercase text-gray-500">Date</p>
          <p className="font-semibold">{formatDateTime(r.createdAt)}</p>
        </div>
      </div>

      {/* Customer / Salesman */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-bold uppercase text-gray-500 mb-1">Customer</p>
          <p className="font-semibold">{r.customerName}</p>
          {r.customerEmail && <p>{r.customerEmail}</p>}
          {r.customerPhone && <p>{r.customerPhone}</p>}
        </div>
        <div>
          <p className="font-bold uppercase text-gray-500 mb-1">Salesman</p>
          <p className="font-semibold">{r.salesmanName}</p>
          {r.salesmanEmail && <p>{r.salesmanEmail}</p>}
        </div>
      </div>

      {/* Order ID + barcode */}
      <div className=" items-center justify-between gap-3 border-y border-dashed border-gray-400 py-2.5">
        <div className="min-w-0">
          <p className="font-bold uppercase text-gray-500 text-[10px]">
            Order ID
          </p>
          <p className="font-mono text-xs font-semibold break-all">
            {r.orderId}
          </p>
        </div>
        <div className="shrink-0">
          <Barcode value={r.orderId} height={48} width={1.6} />
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1 font-bold uppercase">Item</th>
            <th className="text-center py-1 font-bold uppercase">Qty</th>
            <th className="text-right py-1 font-bold uppercase">Price</th>
            <th className="text-right py-1 font-bold uppercase">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {r.items.map((item, i) => (
            <tr key={i}>
              <td className="py-1.5 pr-2">{item.name}</td>
              <td className="py-1.5 text-center">{Number(item.qty || 0).toLocaleString()}</td>
              <td className="py-1.5 text-right">
                {currency}
                {item.price.toLocaleString()}
              </td>
              <td className="py-1.5 text-right font-semibold">
                {currency}
                {(item.qty * item.price).toLocaleString()}
              </td>
            </tr>
          ))}
          {r.items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-3 text-center text-gray-400 italic">
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-black pt-2.5 flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {currency}
            {r.subtotal.toLocaleString()}
          </span>
        </div>
        {r.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount ({r.discountPercent}%)</span>
            <span>
              -{currency}
              {r.discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm border-t border-gray-300 pt-1">
          <span>Total</span>
          <span>
            {currency}
            {r.total.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>
            {currency}
            {r.paidAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{r.returnAmount > 0 ? "Return" : "Due"}</span>
          <span>
            {currency}
            {(r.returnAmount > 0
              ? r.returnAmount
              : r.dueAmount
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* QR (full receipt data) + footer */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-dashed border-gray-400">
        <QRCodeSVG value={qrPayload} size={280} />
        <p className="text-[11px] text-gray-500 text-center">
          Scan for full order details · Thank you for your purchase!
        </p>
      </div>
    </div>
  );
};

export default CashMemo;
