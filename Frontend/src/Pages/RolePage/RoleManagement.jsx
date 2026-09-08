import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import RoleCard from "../../Components/RoleManagement/RoleCard";
import CreateRole from "../../Components/RoleManagement/CreateRole";
import { toast } from "react-toastify";
import { useGetName } from "../../Hooks/userGetAppName";
import { Helmet } from "react-helmet-async";
import { commonInputField } from "../../Theme/commonInputField";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield } from "react-icons/fi";

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
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles/role-for-edit`,
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
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles/update`,
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
      className={`role-management-page ${commonComponentBG("r")} overflow-auto p-3 sm:p-5 lg:p-7 rounded-r-2xl ${showRoleModel && "overflow-hidden"} h-full`}
    >
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-5 sm:p-7 mb-5 shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-200">
              <FiShield size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Access control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Role Management</h1>
            <p className="mt-1 text-sm text-emerald-100/75">
              Build secure roles and control every permission from one place.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-bold text-emerald-950">
            <div className="rounded-xl bg-white/90 px-3 py-2 shadow-sm">
              <span className="block text-lg">{roles.length}</span>
              <span className="text-emerald-800/60">Roles</span>
            </div>
            <div className="rounded-xl bg-emerald-300/90 px-3 py-2 shadow-sm">
              <span className="block text-lg">{Object.keys(roles[0]?.permissions || {}).length || 0}</span>
              <span className="text-emerald-950/60">Permission keys</span>
            </div>
          </div>
        </div>
        <div className="role-hero-orb role-hero-orb-one" aria-hidden="true" />
        <div className="role-hero-orb role-hero-orb-two" aria-hidden="true" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
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
              className={`${commonInputField} pl-10 bg-white/80 border-emerald-200 focus:ring-2 focus:ring-emerald-300`}
            />
          </div>
        </div>
        <div className="sm:shrink-0">
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
        <AnimatePresence initial={false}>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {roles.map((role, index) => (
              <motion.div
                layout
                key={role._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -10 }}
                transition={{ delay: Math.min(index * 0.04, 0.2), type: "spring", stiffness: 280, damping: 25 }}
              >
                <RoleCard
                  role={role}
                  setRoles={setRoles}
                  onPermissionChange={handlePermissionChange}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default RoleManagement;
