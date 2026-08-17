import { FiWifiOff, FiRefreshCw } from "react-icons/fi";

const LiveStatusBadge = ({ status, onReconnect }) => {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
    );
  }

  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
        <FiRefreshCw size={11} className="animate-spin" />
        Connecting...
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onReconnect}
      className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full transition-colors shrink-0"
    >
      <FiWifiOff size={11} />
      Reconnect
    </button>
  );
};

export default LiveStatusBadge;