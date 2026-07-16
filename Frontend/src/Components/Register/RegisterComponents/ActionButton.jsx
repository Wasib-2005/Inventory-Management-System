const COLOR_STYLES = {
  emerald: "bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-emerald-900",
  blue: "bg-blue-50/60 hover:bg-blue-50 border-blue-200 text-blue-900",
  amber: "bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-900",
  purple: "bg-purple-50/60 hover:bg-purple-50 border-purple-200 text-purple-900",
  rose: "bg-rose-50/60 hover:bg-rose-50 border-rose-200 text-rose-900",
  cyan: "bg-cyan-50/60 hover:bg-cyan-50 border-cyan-200 text-cyan-900",
  slate: "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700",
};

const ActionButton = ({
  icon: Icon,
  label,
  color = "slate",
  onClick,
  wide = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${wide ? "col-span-2" : ""} py-2 px-2 flex flex-col items-center justify-center gap-1 rounded-lg border transition-colors group ${COLOR_STYLES[color]}`}
  >
    <Icon className="text-base group-hover:scale-105 transition-transform" />
    <span className="font-semibold text-[10px] text-center">{label}</span>
  </button>
);

export default ActionButton;