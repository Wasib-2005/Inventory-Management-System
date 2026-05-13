import { useState, useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CgProfile } from "react-icons/cg";
import { FiMail, FiPhone, FiCalendar, FiChevronDown, FiCheck } from "react-icons/fi";
import { UserContext } from "../../Contexts/UserContexts/UserContext";

const ROLES = ["user", "admin", "manager", "guest"];

const ROLE_META = {
  admin:   { color: "#e11d48", bg: "#fff1f2" },
  manager: { color: "#d97706", bg: "#fffbeb" },
  user:    { color: "#0d9488", bg: "#f0fdfa" },
  guest:   { color: "#64748b", bg: "#f8fafc" },
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

const AccountListItem = ({ account, onRoleChange }) => {
  const { user: ctxUser } = useContext(UserContext);
  const canManage = ctxUser?.permissions?.hasRolePermissionsChangePermission;

  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen]         = useState(false);
  const dropRef                 = useRef(null);

  const meta = ROLE_META[account.userType] ?? ROLE_META.guest;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.06)",
        borderLeft: `3px solid ${meta.color}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "visible",
      }}
    >
      {/* ── Main row ── */}
      <div
        className="flex items-center gap-3 px-3.5 py-3 cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar */}
        {account.photoUrl && !imgError ? (
          <img
            src={account.photoUrl}
            alt={account.username}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ border: `1.5px solid ${meta.color}30` }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: meta.bg }}
          >
            <CgProfile size={22} style={{ color: meta.color }} />
          </div>
        )}

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-semibold truncate leading-snug"
            style={{ color: "#0f172a" }}
          >
            {account.username}
          </p>
          <p className="text-[12px] truncate mt-0.5" style={{ color: "#94a3b8" }}>
            {account.email}
          </p>
        </div>

        {/* Role pill + chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (canManage) setOpen((v) => !v);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
              style={{
                background: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.color}25`,
                cursor: canManage ? "pointer" : "default",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
              {account.userType}
              {canManage && (
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  <FiChevronDown size={10} />
                </motion.span>
              )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.13 }}
                  className="absolute right-0 top-full mt-2 z-50"
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    minWidth: "120px",
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Caret */}
                  <div
                    className="absolute right-3.5 -top-[5px] w-2 h-2 rotate-45"
                    style={{
                      background: "white",
                      borderLeft: "1px solid rgba(0,0,0,0.08)",
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <div className="py-1">
                    {ROLES.map((role) => {
                      const m = ROLE_META[role];
                      const active = account.userType === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            if (!active) onRoleChange?.(account._id, role);
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium capitalize"
                          style={{
                            color: active ? m.color : "#374151",
                            background: active ? m.bg : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!active) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: m.color }} />
                          {role}
                          {active && (
                            <FiCheck size={11} className="ml-auto" style={{ color: m.color }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "#d1d5db" }}
          >
            <FiChevronDown size={14} />
          </motion.div>
        </div>
      </div>

      {/* ── Expanded details ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-3.5 pb-3 pt-2.5 flex flex-col gap-2"
              style={{ borderTop: "1px solid #f1f5f9" }}
            >
              {[
                { icon: FiMail,     label: account.email },
                { icon: FiPhone,    label: account.phone },
                { icon: FiCalendar, label: `Joined ${fmt(account.createdAt)}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg }}
                  >
                    <Icon size={12} style={{ color: meta.color }} />
                  </div>
                  <span className="text-[12px] truncate" style={{ color: "#64748b" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccountListItem;