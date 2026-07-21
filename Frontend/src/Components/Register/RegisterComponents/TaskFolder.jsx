import { FiAlertTriangle } from "react-icons/fi";
import CargoMovementsPanel from "./CargoMovementsPanel";

const TaskFolder = ({ activeSub }) => {
  if (activeSub === "regular") return <CargoMovementsPanel />;

  // Emergency — no spec/schema for this yet, placeholder until defined
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 gap-2">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
        <FiAlertTriangle size={20} className="text-rose-500" />
      </div>
      <h3 className="text-sm font-bold text-emerald-900">Emergency Tasks — Coming Soon</h3>
      <p className="text-xs text-emerald-700/50 max-w-xs">
        Urgent warehouse tasks will show up here once that's defined.
      </p>
    </div>
  );
};

export default TaskFolder;