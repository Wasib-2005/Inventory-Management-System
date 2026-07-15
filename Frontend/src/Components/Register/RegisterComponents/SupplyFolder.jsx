import { useNavigate } from "react-router";
import ActionButton from "./ActionButton";
import { SUPPLY_ACTIONS } from "./constants";

const SupplyFolder = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-emerald-900">
          Partners & Supply Chain Nodes
        </h3>
        <p className="text-xs text-emerald-700/50 mt-0.5">
          Coordinate supply streams and vendors
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SUPPLY_ACTIONS.map((action) => (
          <ActionButton
            key={action.label}
            {...action}
            onClick={action.to ? () => navigate(action.to) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default SupplyFolder;
