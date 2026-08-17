import { FiEdit2, FiChevronDown, FiChevronUp,  } from "react-icons/fi";
import { SALE_STATUS_STYLES } from "../constants";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const ORDER_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PriceLine = ({
  label,
  value,
  emphasis,
  tone = "default",
  showMinus = false,
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-emerald-700/50">{label}</span>
    <span
      className={`text-[11px] ${emphasis ? "font-bold" : "font-medium"} ${
        tone === "rose"
          ? "text-rose-500"
          : tone === "emerald"
            ? "text-emerald-600"
            : "text-emerald-900"
      }`}
    >
      {showMinus ? "-" : ""}
      {currency}
      {value.toLocaleString()}
    </span>
  </div>
);

const OrderCard = ({ sale, isExpanded, onToggleExpand, onEdit }) => (
  <tr
    onClick={() => onToggleExpand(sale.id)}
    className="cursor-pointer hover:bg-emerald-50/40 transition-colors align-top"
  >
    <td className="p-3 border border-emerald-200/60 font-mono text-xs font-bold text-emerald-700/70">
      {sale.orderCode}
    </td>

    <td className="p-3 border border-emerald-200/60 min-w-[140px]">
      <p className="text-sm font-semibold text-emerald-900 truncate">
        {sale.username}
      </p>
      <p className="text-[10px] text-emerald-700/50 truncate">
        {sale.customerDetails?.email ||
          sale.customerDetails?.phone ||
          "No contact"}
      </p>
    </td>

    <td className="p-3 border border-emerald-200/60 min-w-[120px]">
      <p className="text-xs font-semibold text-emerald-900 truncate">
        {sale.createdBy}
      </p>
      <p className="text-[10px] text-emerald-700/50 truncate">
        {sale.creatorDetails?.email || ""}
      </p>
    </td>

    <td className="p-3 border border-emerald-200/60">
      {sale.orderStatus && (
        <span
          className={`inline-flex text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
            ORDER_STATUS_STYLES[sale.orderStatus] || ORDER_STATUS_STYLES.pending
          }`}
        >
          {sale.orderStatus}
        </span>
      )}
    </td>

    <td className="p-3 border border-emerald-200/60">
      <span
        className={`inline-flex text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
          SALE_STATUS_STYLES[sale.status] || SALE_STATUS_STYLES.Partial
        }`}
      >
        {sale.status}
      </span>
    </td>

    <td className="p-3 pr-4 border border-emerald-200/60 min-w-[150px]">
      <div className="flex flex-col gap-0.5">
        <PriceLine label="Subtotal" value={sale.subtotal} />
        {sale.discountAmount > 0 && (
          <PriceLine
            label={`Discount (${sale.discountPercent}%)`}
            value={sale.discountAmount}
            tone="rose"
            showMinus
          />
        )}
        <PriceLine label="Total" value={sale.total} emphasis />
        <PriceLine label="Received" value={sale.paidAmount} />
        {sale.returnAmount > 0 ? (
          <PriceLine
            label="Return"
            value={sale.returnAmount}
            emphasis
            tone="emerald"
          />
        ) : (
          <PriceLine
            label="Due"
            value={sale.dueAmount}
            emphasis={sale.dueAmount > 0}
            tone={sale.dueAmount > 0 ? "rose" : "default"}
          />
        )}
      </div>
    </td>

    <td className="p-3 pr-4 border border-emerald-200/60 text-right">
      {sale.clickable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(sale);
          }}
          title="Edit payment / status"
          className="p-1.5 text-emerald-700/40 hover:text-emerald-700 hover:bg-emerald-50 rounded-md border border-transparent hover:border-emerald-200 transition-colors"
        >
          <FiEdit2 size={14} />
        </button>
      )}
    </td>
    <td className="p-3 pl-4 border border-emerald-200/60 text-emerald-700/40">
      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
    </td>
  </tr>
);

export default OrderCard;