import { IoAddCircleOutline, IoClose } from "react-icons/io5";
import { primaryButton } from "../../Theme/primaryButton";
import { PALETTE } from "../../Theme/palette";
import { useState } from "react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import EditField from "../AccountsAndPermissions/components/Fields/EditField";
import Toggle from "./Toggle";
import axios from "axios";
import { toast } from "react-toastify";
import { PERMISSION_CONFIG } from "./PERMISSION_CONFIG";

const CreateRole = ({ setRoles, showRoleModel, setShowRoleModel }) => {
  const [roleTitle, setRoleTitle] = useState("");
  const [roleRank, setRoleRank] = useState("");

  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {};
    // Map initial state to the keys in our config
    Object.keys(PERMISSION_CONFIG).forEach((key) => {
      initialPermissions[key] = false;
    });
    return initialPermissions;
  });

  const handleToggleChange = (permissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { roleTitle, roleRank, permissions };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles/create`,
        payload,
        { withCredentials: true },
      );

      setRoles((prev) => [...prev, response.data.role]);
      toast.success(response.data?.message || "Role created successfully!");

      setRoleTitle("");
      setPermissions(
        Object.keys(PERMISSION_CONFIG).reduce(
          (acc, key) => ({ ...acc, [key]: false }),
          {},
        ),
      );

      setShowRoleModel(false);
    } catch (error) {
      console.error("Create role error:", error);
      toast.error(error.response?.data?.message || "Failed to create role");
    }
  };

  // ✅ PRE-GROUP PERMISSIONS based on the config object
  const groupedPermissions = Object.entries(PERMISSION_CONFIG).reduce(
    (acc, [key, config]) => {
      if (!acc[config.group]) acc[config.group] = [];
      acc[config.group].push({ key, label: config.label, order: config.order });
      return acc;
    },
    {},
  );

  return (
    <div className="h-full">
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

      {showRoleModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowRoleModel(false)}
          />

          <div
            className={`${commonComponentBG()} relative z-10 w-full max-w-md transform overflow-hidden rounded-xl p-6 shadow-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 `}
          >
            <div className="flex items-center justify-between ">
              <h3 className="text-xl font-semibold ">Create New Role</h3>
              <button
                onClick={() => setShowRoleModel(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <IoClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 mt-4">
              <div className="flex gap-2">
                <EditField
                  editing={true}
                  label={"Role Name"}
                  fieldKey="roleName"
                  value={roleTitle}
                  onChange={(key, value) => setRoleTitle(value)}
                />
                <EditField
                  editing={true}
                  label={"Role Rank"}
                  fieldKey="roleRank"
                  value={roleRank}
                  onChange={(key, value) => setRoleRank(value)}
                />
              </div>

              {/* ✅ RENDER GROUPED UI */}
              <div className="space-y-4 pt-4 max-h-72 overflow-y-auto hover:pr-2">
                {Object.entries(groupedPermissions).map(
                  ([groupName, items]) => (
                    <div key={groupName} className="mb-2">
                      {/* Header: e.g., "user related data:" */}
                      <p className="text-gray-800 font-bold capitalize mb-1">
                        {groupName}:
                      </p>

                      {/* Indented Container for Actions */}
                      <div className="flex flex-col gap-1 ml-4 border-l-2 border-emerald-100 pl-4">
                        {items.map(({ key, label }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-1"
                          >
                            {/* Label: e.g., "change", "create" */}
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {label}
                            </span>
                            <Toggle
                              checked={permissions[key]}
                              onChange={() => handleToggleChange(key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
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
