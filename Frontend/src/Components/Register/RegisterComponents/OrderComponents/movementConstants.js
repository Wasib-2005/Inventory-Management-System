import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import { AiOutlineBarcode } from "react-icons/ai";

export const MOVEMENT_TYPES = ["inbound", "outbound", "count"];

export const MOVEMENT_TYPE_META = {
  inbound: {
    id: "inbound",
    label: "Inbound",
    icon: FiArrowDownLeft,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    title: "Receive Inbound",
    submitLabel: "Confirm Receipt",
  },
  outbound: {
    id: "outbound",
    label: "Outbound",
    icon: FiArrowUpRight,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
    solid: "bg-amber-600 hover:bg-amber-700",
    title: "Dispatch Outbound",
    submitLabel: "Confirm Dispatch",
  },
  count: {
    id: "count",
    label: "Cycle Count",
    icon: AiOutlineBarcode,
    accent: "text-purple-600 bg-purple-50 border-purple-200",
    solid: "bg-purple-600 hover:bg-purple-700",
    title: "Cycle Count",
    submitLabel: "Save Count",
  },
};