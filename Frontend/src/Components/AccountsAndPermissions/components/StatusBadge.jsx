import { STATUS_BADGE } from "../data/helpers";

const STATUS_CLASS = {
  "badge-success": "bg-[#EAF3DE] text-[#3B6D11]",
  "badge-warning": "bg-[#FAEEDA] text-[#854F0B]",
  "badge-danger":  "bg-[#FCEBEB] text-[#A32D2D]",
  "badge-info":    "bg-[#E6F1FB] text-[#185FA5]",
};

const StatusBadge = ({ status, variant = "status" }) => {
  const cls = variant === "role"
    ? STATUS_CLASS["badge-info"]
    : STATUS_CLASS[STATUS_BADGE[status]] ?? STATUS_CLASS["badge-warning"];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
