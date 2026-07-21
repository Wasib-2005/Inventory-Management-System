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
export const initialSales = [
  {
    id: "1",
    username: "John Doe",
    mobile: "+1 555-0199",
    receipt: "REC-2026-0891",
    mrp: 1200,
    discount: 200,
    boughtPrice: 1000,
    status: "Paid",
    type: "Cash",
  },
  {
    id: "2",
    username: "Sarah Smith",
    mobile: "+1 555-0143",
    receipt: "REC-2026-0892",
    mrp: 450,
    discount: 0,
    boughtPrice: 450,
    status: "Credit",
    type: "Net-30",
  },
  {
    id: "3",
    username: "Alex Rivera",
    mobile: "+1 555-0177",
    receipt: "REC-2026-0893",
    mrp: 3500,
    discount: 500,
    boughtPrice: 3000,
    status: "Partial",
    type: "Split-Credit",
  },
];

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
  Credit: "bg-rose-50 text-rose-700 border-rose-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

// "Sell" tab action tiles.
export const OPERATIONS_ACTIONS = [
  { id: "make-order", icon: HiClipboardDocument, label: "Make an Order", color: "blue" },
  { id: "receive-inbound", icon: HiArrowDownLeft, label: "Receive Inbound", color: "emerald" },
  { id: "dispatch-outbound", icon: HiArrowUpRight, label: "Dispatch Outbound", color: "amber" },
  { id: "cycle-count", icon: AiOutlineBarcode, label: "Cycle Count", color: "purple" },
];