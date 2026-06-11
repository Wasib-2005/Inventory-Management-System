import { IoAddCircleOutline, IoClose } from "react-icons/io5";
import { primaryButton } from "../../Theme/primaryButton";
import { PALETTE } from "../../Theme/palette";
import { useState } from "react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import EditField from "../AccountsAndPermissions/components/Fields/EditField";
import Toggle from "./Toggle";
import { PERMISSION_LABELS } from "./PERMISSION_LABELS";

const CreateRole = ({ showRoleModel, setShowRoleModel }) => {
  const [roleTitle, setRoleTitle] = useState("");

  // Initialize all permissions dynamically from PERMISSION_LABELS as 'false'
  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {};
    Object.keys(PERMISSION_LABELS).forEach((key) => {
      initialPermissions[key] = false;
    });
    return initialPermissions;
  });

  // Handler to toggle an individual permission state
  const handleToggleChange = (permissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combined payload ready for your API call
    console.log("Creating role payload:", {
      roleTitle, // Capture this from your EditField if it sets roleTitle
      ...permissions,
    });

    // Reset and close
    setRoleTitle("");
    setPermissions(
      Object.keys(PERMISSION_LABELS).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
    setShowRoleModel(false);
  };

  return (
    <div className="h-full">
      {/* Trigger Button */}
      <button
        className={`${primaryButton} flex gap-1 justify-center items-center h-full text-white transition-transform active:scale-95`}
        style={{
          background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
          boxShadow: "0 3px 10px rgba(47,160,132,0.35)",
        }}
        onClick={() => setShowRoleModel(true)}
      >
        <span>Role</span>
        <IoAddCircleOutline size={18} />
      </button>

      {/* Modal Backdrop and Wrapper */}
      {showRoleModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Black Translucent Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowRoleModel(false)}
          />

          {/* Modal Card Content */}
          <div
            className={`${commonComponentBG()} relative z-10 w-full max-w-md transform overflow-hidden rounded-xl p-6 shadow-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between ">
              <h3 className="text-xl font-semibold ">Create New Role</h3>
              <button
                onClick={() => setShowRoleModel(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <IoClose size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <EditField editing={true} label={"Role Name"} value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
              </div>

              {/* Toggles Container */}
              <div className="space-y-3 pt-2 max-h-60 overflow-y-auto">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium ">{label}</span>
                    <Toggle
                      checked={permissions[key]}
                      onChange={() => handleToggleChange(key)}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRoleModel(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
                  }}
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRole;