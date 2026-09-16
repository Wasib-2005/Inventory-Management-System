import { QRCodeSVG } from "qrcode.react";
import Barcode from "./Barcode";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "৳";
const APP_NAME = import.meta.env.VITE_APP_NAME || "Store";

const formatDateTime = (dateString) => {
  const d = dateString ? new Date(dateString) : new Date();
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const RETURN_WINDOW_DAYS = Number(import.meta.env.VITE_RETURN_WINDOW_DAYS) || 0;

const formatCoverage = (value, label) => {
  if (!value) return "—";
  const number = Number(value);
  return `${number} month${number === 1 ? "" : "s"} ${label}`;
};

const wrapEmail = (email) => {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return (
    <>
      <span className="break-all">{local}</span>
      <wbr />@{domain}
    </>
  );
};

// Same derivation logic as SellPanel's mapOrderToRow, so the receipt
// always agrees with what's shown in the order list — works whether it's
// handed a freshly-created order (from createOrder's response) or one
// patched locally after a payment/confirm action.
const deriveReceipt = (order) => {
  const items = order.items || [];
  const movementType = order._type || order.type;
  const isMovement = movementType === "inbound" || movementType === "outbound";
  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      (Number(i.qty) || 0) * (Number(i.price ?? i.product?.pricing?.mrp) || 0),
    0,
  );
  const discountAmount = Number(order.payment?.discountAmount) || 0;
  const discountPercent =
    subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
  const total = Number(order.total ?? Math.max(subtotal - discountAmount, 0));
  const paidAmount = Number(order.payment?.paidAmount) || 0;
  const dueAmount = Math.max(
    Number(order.dueAmount ?? total - paidAmount) || 0,
    0,
  );
  const returnAmount = Math.max(Number(order.returnAmount) || 0, 0);

  const customer = order.customerId || null;
  const guest = order.guestCustomer || null;

  return {
    isMovement,
    movementType,
    receiptTitle: isMovement
      ? `${movementType === "inbound" ? "Inbound" : "Outbound"} receipt`
      : "Sales receipt",
    orderId: String(order._id || ""),
    createdAt: order.createdAt || order.date,
    customerName: isMovement
      ? order.supplier?.name ||
        order.supplier?.companyName ||
        (movementType === "inbound" ? "Supplier / Warehouse" : "Warehouse / Supplier")
      :
      customer?.displayName ||
      customer?.username ||
      guest?.username ||
      order.username ||
      "Walk-in",
    customerEmail: customer?.email || guest?.email || order.email || "",
    customerPhone: customer?.phone || guest?.mobile || order.mobile || "",
    salesmanName: isMovement
      ? order.receivedBy?.displayName ||
        order.receivedBy?.username ||
        order.dispatchedBy?.displayName ||
        order.dispatchedBy?.username ||
        "—"
      :
      order.createdBy?.displayName || order.createdBy?.username || "—",
    salesmanEmail: isMovement
      ? order.receivedBy?.email || order.dispatchedBy?.email || ""
      : order.createdBy?.email || "",
    items: items.map((item) => ({
      name: item.product?.name || item.productData?.name || item.name || "Item",
      coverage: [
        formatCoverage(
          item.product?.guarantee ?? item.productData?.guarantee,
          "guarantee",
        ),
        formatCoverage(
          item.product?.warranty ?? item.productData?.warranty,
          "warranty",
        ),
      ].filter((value) => value !== "—").join(" / ") || "—",
      qty: Number(item.qty ?? item.receivedQty ?? item.dispatchedQty) || 0,
      price: Number(
        item.price ??
          item.product?.pricing?.mrp ??
          item.productData?.pricing?.mrp,
      ) || 0,
    })),
    subtotal,
    discountAmount,
    discountPercent,
    total,
    paidAmount,
    dueAmount,
    returnAmount,
    reference: order.reference || "",
    notes: order.notes || "",
    trackCode: order.trackCode || "",
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
    receiptType: r.receiptTitle,
    reference: r.reference,
    trackCode: r.trackCode,
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
      className="receipt-paper bg-white text-black w-full max-w-xl mx-auto p-6 sm:p-8 flex flex-col gap-4 font-sans"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            className="w-10 h-10 object-contain"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div>
            <span className="block text-lg font-black tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              {r.receiptTitle}
            </span>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold uppercase text-gray-500">Date</p>
          <p className="font-semibold">{formatDateTime(r.createdAt)}</p>
        </div>
      </div>

      {/* Customer / Salesman */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="min-w-0">
          <p className="font-bold uppercase text-gray-500 mb-1">
            {r.isMovement
              ? r.movementType === "inbound"
                ? "Source"
                : "Destination"
              : "Customer"}
          </p>
          <p className="font-semibold">{r.customerName}</p>
          {r.customerEmail && <p>{wrapEmail(r.customerEmail)}</p>}
          {r.customerPhone && <p>{r.customerPhone}</p>}
        </div>
        <div className="min-w-0">
          <p className="font-bold uppercase text-gray-500 mb-1">
            {r.isMovement
              ? r.movementType === "inbound"
                ? "Received by"
                : "Dispatched by"
              : "Salesman"}
          </p>
          <p className="font-semibold">{r.salesmanName}</p>
          {r.salesmanEmail && <p>{wrapEmail(r.salesmanEmail)}</p>}
        </div>
      </div>

      {/* Full order ID and barcode */}
      <div className="border-y border-dashed border-gray-400 py-2.5 text-center">
        <div>
          <p className="font-bold uppercase text-gray-500 text-[10px]">
            {r.isMovement ? "Movement ID" : "Order ID"}
          </p>
          <p className="font-mono text-[10px] font-semibold break-all">
            {r.orderId}
          </p>
        </div>
        <div className="mt-1 flex justify-center">
          <Barcode value={r.orderId} height={42} width={1.4} />
        </div>
      </div>

      {/* Items */}
      <table className="w-full table-fixed text-xs receipt-items">
        <thead>
          <tr className="border-b border-black">
            <th className="w-[28%] text-left py-1 font-bold uppercase">Item</th>
            <th className="w-[27%] text-left py-1 font-bold uppercase">
              {r.isMovement ? "Reference" : "Guarantee / Warranty"}
            </th>
            <th className="w-[10%] text-center py-1 font-bold uppercase">Qty</th>
            <th className="w-[17%] text-right py-1 font-bold uppercase">Price</th>
            <th className="w-[18%] text-right py-1 font-bold uppercase">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {r.items.map((item, i) => (
            <tr key={i}>
              <td className="py-1.5 pr-2 font-medium">{item.name}</td>
              <td className="py-1.5 pr-2 text-[10px]">
                {r.isMovement ? r.reference || r.trackCode || "—" : item.coverage}
              </td>
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
              <td colSpan={5} className="py-3 text-center text-gray-400 italic">
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-black pt-2.5 flex flex-col gap-1 text-xs receipt-totals">
        {r.isMovement ? (
          <div className="flex justify-between">
            <span>Total units</span>
            <span>{r.items.reduce((sum, item) => sum + item.qty, 0).toLocaleString()}</span>
          </div>
        ) : null}
        {!r.isMovement && <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {currency}
            {r.subtotal.toLocaleString()}
          </span>
        </div>}
        {!r.isMovement && <div className="flex justify-between">
          <span>Discount ({r.discountPercent}%)</span>
          <span>
            -{currency}
            {r.discountAmount.toLocaleString()}
          </span>
        </div>}
        {!r.isMovement && <div className="flex justify-between font-black text-base border-t border-gray-300 pt-2 mt-1">
          <span>Total</span>
          <span>
            {currency}
            {r.total.toLocaleString()}
          </span>
        </div>}
        {!r.isMovement && <div className="flex justify-between">
          <span>Paid</span>
          <span>
            {currency}
            {r.paidAmount.toLocaleString()}
          </span>
        </div>}
        {!r.isMovement && <div className="flex justify-between font-bold">
          <span>{r.returnAmount > 0 ? "Return" : "Due"}</span>
          <span>
            {currency}
            {(r.returnAmount > 0
              ? r.returnAmount
              : r.dueAmount
            ).toLocaleString()}
          </span>
        </div>}
      </div>

      {/* QR (full receipt data) + footer */}
      <div className="flex flex-col items-center gap-2 pt-3 border-t border-dashed border-gray-400">
        <QRCodeSVG value={qrPayload} size={260} level="M" includeMargin />
        <p className="text-[11px] text-gray-500 text-center">
          {r.isMovement
            ? `Inventory ${r.movementType} recorded successfully.`
            : "Thank you for your purchase!"}
          {RETURN_WINDOW_DAYS > 0 &&
            ` Returns are accepted within ${RETURN_WINDOW_DAYS} days, subject to store policy.`}
        </p>
      </div>
    </div>
  );
};

export default CashMemo;
