import { useState, useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgProfile } from "react-icons/cg";
import {
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import axios from "axios";

// Configuration for UI colors based on role
const META = {
  admin: { color: "#e11d48", bg: "#fff1f2" },
  manager: { color: "#d97706", bg: "#fffbeb" },
  user: { color: "#0d9488", bg: "#f0fdfa" },
  guest: { color: "#64748b", bg: "#f8fafc" },
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const AccountListItem = ({ account, onRoleChange }) => {
  const { user } = useContext(UserContext);
  const canManage = user?.permissions?.hasRolePermissionsChangePermission;

  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const dropRef = useRef(null);
  
  // Fallback to guest style if the userType isn't in our META object
  const m = META[account.userType] || META.guest;

  // Optimized Fetch: Only called when the dropdown is opened
  const fetchRoles = async () => {
    if (roles.length > 0 || loadingRoles) return;
    setLoadingRoles(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles`
      );
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!dropRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[14px] border border-black/5 shadow-sm overflow-visible mb-2"
      style={{ borderLeft: `3px solid ${m.color}` }}
    >
      {/* Main Row */}
      <div
        className="md:flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Profile Image/Icon */}
        {account.photoUrl && !imgError ? (
          <img
            src={account.photoUrl}
            alt={account.username}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ border: `1.5px solid ${m.color}30` }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: m.bg }}
          >
            <CgProfile size={42} style={{ color: m.color }} />
          </div>
        )}

        <div className="flex flex-1 justify-between items-center gap-4">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-slate-900 truncate">
              {account.username}
            </p>
            <p className="text-[12px] text-slate-400 truncate mt-0.5">
              {account.email}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Role Dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canManage) {
                    fetchRoles(); // Trigger lazy load
                    setOpen((v) => !v);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all"
                style={{
                  background: m.bg,
                  color: m.color,
                  border: `1px solid ${m.color}25`,
                  cursor: canManage ? "pointer" : "default",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: m.color }}
                />
                {account.userType}
                {canManage && (
                  <motion.span animate={{ rotate: open ? 180 : 0 }}>
                    <FiChevronDown size={10} />
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 z-50 py-1 bg-white rounded-xl border border-black/10 shadow-xl min-w-[140px] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {loadingRoles ? (
                      <div className="px-4 py-2 text-[11px] text-slate-400">Loading...</div>
                    ) : (
                      roles.map((role) => {
                        const rm = META[role] || META.guest;
                        const active = account.userType === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              if (!active) onRoleChange?.(account._id, role);
                              setOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium capitalize transition-colors hover:bg-slate-50"
                            style={{
                              color: active ? rm.color : "#374151",
                              background: active ? rm.bg : "transparent",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: rm.color }}
                            />
                            {role}
                            {active && <FiCheck size={11} className="ml-auto" />}
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="text-slate-300">
              <FiChevronDown size={14} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="px-4 pb-3 pt-2.5 flex flex-col gap-2">
              <DetailRow icon={FiMail} label={account.email} m={m} />
              <DetailRow icon={FiPhone} label={account.phone || "No phone provided"} m={m} />
              <DetailRow icon={FiCalendar} label={`Joined ${fmt(account.createdAt)}`} m={m} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Sub-component for clean expanded rows
const DetailRow = ({ icon: Icon, label, m }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
      <Icon size={12} style={{ color: m.color }} />
    </div>
    <span className="text-[12px] text-slate-500 truncate">{label}</span>
  </div>
);

export default AccountListItem;