import {
  HiClipboardDocument,
  HiArrowDownLeft,
  HiArrowUpRight,
} from "react-icons/hi2";
import { AiOutlineBarcode } from "react-icons/ai";

// TODO: there's no Sale/Transaction schema yet, so this is static mock data.
// Once that model exists, replace this with a GET (e.g. /api/sales/today)
// and keep the shape below the same so OperationsFolder's list doesn't
// need changes.

// TODO: also no Credit/Debt Ledger schema yet — static mock until that
// exists. `type: "credit"` = money owed TO the business by a customer.
// `type: "debt"` = money the business owes OUT to a supplier/vendor.
export const initialCreditLedger = [
  {
    id: "c1",
    type: "credit",
    customer: "Sarah Smith",
    outstanding: 450,
    limit: 5000,
    dueDate: "Aug 12, 2026",
  },
  {
    id: "c2",
    type: "credit",
    customer: "Alex Rivera",
    outstanding: 1200,
    limit: 3000,
    dueDate: "Jul 28, 2026",
  },
  {
    id: "c3",
    type: "credit",
    customer: "Apex Builders",
    outstanding: 8400,
    limit: 10000,
    dueDate: "Overdue",
  },
  {
    id: "d1",
    type: "debt",
    customer: "Vanguard Tech Supplies",
    outstanding: 2600,
    limit: 15000,
    dueDate: "Aug 5, 2026",
  },
  {
    id: "d2",
    type: "debt",
    customer: "Northline Logistics",
    outstanding: 950,
    limit: 5000,
    dueDate: "Overdue",
  },
];

export const SALE_STATUS_STYLES = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Due: "bg-rose-50 text-rose-700 border-rose-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

// "Sell" tab action tiles.
export const OPERATIONS_ACTIONS = [
  {
    id: "make-order",
    icon: HiClipboardDocument,
    label: "Make an Order",
    color: "blue",
  },
  {
    id: "receive-inbound",
    icon: HiArrowDownLeft,
    label: "Receive Inbound",
    color: "emerald",
  },
  {
    id: "dispatch-outbound",
    icon: HiArrowUpRight,
    label: "Dispatch Outbound",
    color: "amber",
  },
  {
    id: "cycle-count",
    icon: AiOutlineBarcode,
    label: "Cycle Count",
    color: "purple",
  },
];

export const getPaymentDisplayStatus = (paidAmount, total) => {
  const paid = Number(paidAmount) || 0;
  const grandTotal = Number(total) || 0;
  if (paid <= 0) return "Due";
  if (paid < grandTotal) return "Partial";
  return "Paid";
};
