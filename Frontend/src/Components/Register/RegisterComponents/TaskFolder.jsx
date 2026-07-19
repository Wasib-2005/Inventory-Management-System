import { FiClock } from "react-icons/fi";

const TaskFolder = () => (
  <div className="flex flex-col items-center justify-center text-center py-14 gap-2">
    <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
      <FiClock size={20} className="text-purple-500" />
    </div>
    <h3 className="text-sm font-bold text-emerald-900">Tasks — Coming Soon</h3>
    <p className="text-xs text-emerald-700/50 max-w-xs">
      Warehouse tasks and assignments will show up here once that's wired up.
    </p>
  </div>
);

export default TaskFolder;