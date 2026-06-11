import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PERMISSION_LABELS } from "./PERMISSION_LABELS";
import Toggle from "./Toggle";



const RoleCard = ({ role, onPermissionChange }) => {
  return (
    <div className={`${commonComponentBG()} p-0`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-700 font-semibold text-sm uppercase">
              {role.roleTitle[0]}
            </span>
          </div>
          <span className="font-semibold text-gray-800 capitalize">
            {role.roleTitle}
          </span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {role._id.slice(-6)}
        </span>
      </div>

      {/* Permissions */}
      <div className="flex flex-col gap-0 px-2 pb-3">
        {Object.entries(role.permissions).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-emerald-50/60 transition-colors"
          >
            <span className="text-sm text-gray-600">
              {PERMISSION_LABELS[key] ?? key}
            </span>
            <Toggle
              checked={value}
              onChange={() => onPermissionChange(role._id, key, !value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleCard;
