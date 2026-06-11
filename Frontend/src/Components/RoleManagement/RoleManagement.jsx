import axios from "axios";
import { useEffect, useState } from "react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import RoleCard from "./RoleCard";
import CreateRole from "./CreateRole";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRoleModel, setShowRoleModel] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchRoles(search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handlePermissionChange = (roleId, permKey, newValue) => {
    setRoles((prev) =>
      prev.map((r) =>
        r._id === roleId
          ? { ...r, permissions: { ...r.permissions, [permKey]: newValue } }
          : r,
      ),
    );
    // Optionally: send PATCH to backend here
  };

  return (
    <div
      className={` ${commonComponentBG()} p-6 rounded-r-2xl ${showRoleModel&&"overflow-hidden"}`}
    >
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
              className="w-full pl-9 pr-4 py-2 bg-white/60 border border-emerald-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>
        </div>
        <div>
          <CreateRole
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
              onPermissionChange={handlePermissionChange}
            />
          ))}
          {roles.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              onPermissionChange={handlePermissionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
