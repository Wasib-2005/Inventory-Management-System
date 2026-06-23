import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import RoleCard from "../../Components/RoleManagement/RoleCard";
import CreateRole from "../../Components/RoleManagement/CreateRole";
import { toast } from "react-toastify";
import { useGetName } from "../../Hooks/userGetAppName";
import { Helmet } from "react-helmet-async";
import { commonInputField } from "../../Theme/commonInputField";

const RoleManagement = () => {
  const pageName = `Role Management | ${useGetName}`;
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRoleModel, setShowRoleModel] = useState(false);
  const isInitialMount = useRef(true); // Used to prevent duplicate initial API fetches

  const fetchRoles = async (query = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/get-role-for-edit`,
        {
          params: query ? { search: query } : {},
          withCredentials: true,
        },
      );
      setRoles(res.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch instantly on initial component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // 2. Debounced search logic (skips the very first layout render to avoid duplicate API hits)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      fetchRoles(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // 3. Finished Permission Update Logic
  const handlePermissionChange = async (roleId, permKey, newValue) => {
    // Locate the current role state to reference old values if a fallback is needed
    const originalRole = roles.find((r) => r._id === roleId);
    if (!originalRole) return;

    // A. OPTIMISTIC UPDATE: Change state right away for instant visual toggling
    setRoles((prev) =>
      prev.map((r) =>
        r._id === roleId
          ? { ...r, permissions: { ...r.permissions, [permKey]: newValue } }
          : r,
      ),
    );

    try {
      // B. IMMUTABLE PAYLOAD: Construct a brand new payload without altering the state directly
      const updatedPayload = {
        ...originalRole,
        permissions: {
          ...originalRole.permissions,
          [permKey]: newValue,
        },
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/update_role`,
        updatedPayload,
        { withCredentials: true }, // Ensured authentication tokens/cookies transfer over
      );

      toast.success(
        response.data?.message || "Permissions updated successfully!",
      );
    } catch (error) {
      console.error("Failed updating role permission on server:", error);
      toast.error(
        error.response?.data?.message || "Failed to update permissions.",
      );

      // C. ROLLBACK: Revert the UI switch back to its original status if backend fails
      setRoles((prev) =>
        prev.map((r) =>
          r._id === roleId
            ? { ...r, permissions: { ...r.permissions, [permKey]: !newValue } }
            : r,
        ),
      );
    }
  };

  return (
    <div
      className={` ${commonComponentBG("r")} overflow-auto p-6 rounded-r-2xl ${showRoleModel && "overflow-hidden"} h-full`}
    >
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage roles and their permissions
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {/* Search bar */}
        <div className={`${commonComponentBG()} overflow-visible w-full`}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className={`${commonInputField} pl-10`}
            />
          </div>
        </div>
        <div>
          <CreateRole
            setRoles={setRoles}
            showRoleModel={showRoleModel}
            setShowRoleModel={setShowRoleModel}
          />
        </div>
      </div>

      {/* Role cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-emerald-500 text-sm">
          Loading roles…
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <svg
            className="w-8 h-8 text-emerald-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-3-3v6M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
            />
          </svg>
          No roles found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              setRoles={setRoles}
              onPermissionChange={handlePermissionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
