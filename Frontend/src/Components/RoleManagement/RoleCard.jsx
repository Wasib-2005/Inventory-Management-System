import { commonComponentBG } from "../../Theme/commonComponentBG";
import { PERMISSION_CONFIG } from "./PERMISSION_CONFIG";
import Toggle from "./Toggle";
import { GrUserAdmin, GrUserManager } from "react-icons/gr";
import { FaUser } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const RoleCard = ({ role, setRoles, onPermissionChange, onDeleteSuccess }) => {
  const cleanTitle = role?.roleTitle?.toLowerCase() || "";

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to permanently delete the "${role?.roleTitle}" role.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#1f2937",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/delete-role?id=${role._id}`,
        { withCredentials: true },
      );

      toast.success(res.data?.message || "Role deleted successfully");

      if (setRoles) {
        setRoles((prevRoles) => prevRoles.filter((r) => r._id !== role._id));
      }

      if (onDeleteSuccess) {
        onDeleteSuccess(role._id);
      }
    } catch (error) {
      console.error("Deletion failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  // ✅ Group and Sort Logic
  const groupedRolePermissions = Object.entries(role?.permissions || {}).reduce(
    (acc, [key, value]) => {
      const config = PERMISSION_CONFIG[key];
      const groupName = config?.group || "other permissions";
      const label = config?.label || key;
      const order = config?.order || 99;

      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push({ key, value, label, order });
      return acc;
    },
    {}
  );

  // Apply sorting to each group
  Object.keys(groupedRolePermissions).forEach((group) => {
    groupedRolePermissions[group].sort((a, b) => a.order - b.order);
  });

  return (
    <div className={`${commonComponentBG()} p-0`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            {cleanTitle === "admin" ? (
              <GrUserAdmin />
            ) : cleanTitle === "manager" ? (
              <GrUserManager />
            ) : (
              <span className="text-emerald-700 font-semibold text-sm uppercase">
                <FaUser />
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-800 capitalize">
            {role?.roleTitle}
          </span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {role?._id?.slice(-6) || "******"}
        </span>
      </div>

      {/* Permissions List */}
      <div className="flex flex-col gap-0 px-4 pt-3 pb-3">
        {Object.entries(groupedRolePermissions).map(([groupName, items]) => (
          <div key={groupName} className="mb-3">
            <p className="text-gray-800 font-bold capitalize mb-1">
              {groupName}:
            </p>

            <div className="flex flex-col gap-1 ml-4 border-l-2 border-emerald-100 pl-4">
              {items.map(({ key, value, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {label}
                  </span>
                  <Toggle
                    checked={value}
                    onChange={() => onPermissionChange(role._id, key, !value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <hr className="border-gray-100 mt-2 mb-2" />

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 cursor-pointer"
          >
            <IoTrashOutline size={16} />
            <span>Delete Role</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;