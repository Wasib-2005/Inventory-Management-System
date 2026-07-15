import ActionButton from "./ActionButton";
import { OPERATIONS_ACTIONS } from "./constants";

const OperationsFolder = () => (
  <div>
    <div className="mb-4">
      <h3 className="text-sm font-bold text-emerald-900">Daily Activity Workflows</h3>
      <p className="text-xs text-emerald-700/50 mt-0.5">
        Manage live cargo & inventory movements
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {OPERATIONS_ACTIONS.map((action) => (
        <ActionButton key={action.label} {...action} />
      ))}
    </div>
  </div>
);

export default OperationsFolder;
