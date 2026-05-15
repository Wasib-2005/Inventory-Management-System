import { useState, useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgProfile } from "react-icons/cg";
import {
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiCheck,
  FiBriefcase,
  FiMapPin,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import useGetRole from "../../Service/useGetRoles";

// Configuration for UI colors based on role
const META = {
  admin: { color: "#e11d48", bg: "#fff1f2" },
  manager: { color: "#d97706", bg: "#fffbeb" },
  user: { color: "#0d9488", bg: "#f0fdfa" },
  guest: { color: "#64748b", bg: "#f8fafc" },
};

// Map status variants to specific styling rules
const STATUS_META = {
  active: "bg-green-50 text-green-700 border-green-200",
  onboarding: "bg-blue-50 text-blue-700 border-blue-200",
  on_leave: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  terminated: "bg-red-50 text-red-700 border-red-200",
};

const fmt = (iso) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AccountListItem = ({ account, onRoleChange }) => {
  const { user } = useContext(UserContext);
  const canManage = user?.permissions?.hasRolePermissionsChangePermission;

  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);

  const { roles, loading: loadingRoles } = useGetRole();

  const dropRef = useRef(null);

  const m = META[account.userType] || META.guest;

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
        className="md:flex items-center gap-4 px-4 py-3.5 cursor-pointer select-none"
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

        <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Identity & Basic Employment Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[14px] font-bold text-slate-900 truncate">
                {account.displayName || account.username}
              </p>
              {account.employeeId && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {account.employeeId}
                </span>
              )}
              {account.employmentStatus && (
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_META[account.employmentStatus] || "bg-gray-100 text-gray-700"}`}
                >
                  {account.employmentStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[12px] text-slate-400 mt-1">
              <span className="font-medium text-slate-600">
                {account.jobTitle || "No Title assigned"}
              </span>
              <span className="text-slate-300">•</span>
              <span>@{account.username}</span>
              <span className="text-slate-300">•</span>
              <span className="truncate">{account.email}</span>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0 self-end sm:self-auto">
            {/* Role Dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canManage) {
                    setOpen((v) => !v);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all shadow-sm"
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
                      <div className="px-4 py-2 text-[11px] text-slate-400">
                        Loading...
                      </div>
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
                            {active && (
                              <FiCheck size={11} className="ml-auto" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-slate-300 p-1"
            >
              <FiChevronDown size={14} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Details Display Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Employment Details */}
              <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                  Employment Details
                </p>
                <DetailRow
                  icon={FiBriefcase}
                  label={`${account.employmentType || "N/A"} employee`}
                  m={m}
                />
                <DetailRow
                  icon={FiCalendar}
                  label={`Hired: ${fmt(account.hireDate)}`}
                  m={m}
                />
                <DetailRow
                  icon={FiUser}
                  label={`Gender: ${account.gender || "Not specified"}`}
                  m={m}
                />
                {account.dateOfBirth && (
                  <DetailRow
                    icon={FiCalendar}
                    label={`DOB: ${fmt(account.dateOfBirth)}`}
                    m={m}
                  />
                )}
              </div>

              {/* Column 2: Contact & Location */}
              <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                  Contact & Location
                </p>
                <DetailRow icon={FiMail} label={account.email} m={m} />
                <DetailRow
                  icon={FiPhone}
                  label={account.phone || "No phone on file"}
                  m={m}
                />
                {account.address?.street ? (
                  <DetailRow
                    icon={FiMapPin}
                    label={`${account.address.street}, ${account.address.city}, ${account.address.country}`}
                    m={m}
                  />
                ) : (
                  <DetailRow
                    icon={FiMapPin}
                    label="No address registered"
                    m={m}
                  />
                )}
              </div>

              {/* Column 3: Emergency Contact & Operations */}
              <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                  Emergency Contact
                </p>
                {account.emergencyContact?.name ? (
                  <>
                    <DetailRow
                      icon={FiAlertCircle}
                      label={account.emergencyContact.name}
                      m={m}
                    />
                    <p className="text-[11px] text-slate-400 pl-9 -mt-1 capitalize">
                      Relationship: {account.emergencyContact.relationship}
                    </p>
                    <DetailRow
                      icon={FiPhone}
                      label={account.emergencyContact.phone}
                      m={m}
                    />
                  </>
                ) : (
                  <p className="text-[12px] italic text-slate-400 my-auto pl-2">
                    No emergency information on file.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, m }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div
      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: m.bg }}
    >
      <Icon size={12} style={{ color: m.color }} />
    </div>
    <span className="text-[12px] text-slate-600 truncate font-medium text-wrap">
      {label}
    </span>
  </div>
);

export default AccountListItem;
