import {  useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiSearch,
  FiRotateCcw,
  FiChevronDown,
} from "react-icons/fi";

import { PALETTE } from "../../Theme/palette";
import Field from "../Common/Field";
import { commonInputField } from "../../Theme/commonInputField";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import { primaryButton } from "../../Theme/primaryButton";
import { secondaryButton } from "../../Theme/secondaryButton";
import useGetRole from "../../Service/useGetRoles";


const DEFAULT = {
  username: "",
  email: "",
  phone: "",
  role: "all",
  sortBy: "name-asc",
};
const SORT_OPTS = [
  { value: "name-asc", label: "A → Z" },
  { value: "name-desc", label: "Z → A" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const AccountsFilterForm = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT);

  const { roles } = useGetRole();


  const set = (e) =>
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  const reset = () => setFilters(DEFAULT);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex-shrink-0 mt-3"
    >
      <div className={commonComponentBG}>
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer md:cursor-default"
          onClick={() => setIsOpen((v) => !v)}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: PALETTE.mint }}
            >
              <FiSearch size={11} className="text-white" />
            </div>
            <span className="text-[11px] font-bold text-emerald-900/60 uppercase tracking-wider">
              Filters
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="md:hidden text-emerald-700/50"
          >
            <FiChevronDown size={16} />
          </motion.div>
        </div>

        {/* Body */}
        <AnimatePresence initial={false}>
          {(isOpen || window.innerWidth >= 768) && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto", marginTop: 0 },
                collapsed: { opacity: 0, height: 0, marginTop: -12 },
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div className="h-px bg-emerald-300/40" />

              <div className="flex flex-col gap-2.5">
                <div className="md:flex w-full gap-2">
                  <Field icon={FiUser} label="Username">
                    <input
                      type="text"
                      name="username"
                      value={filters.username}
                      onChange={set}
                      placeholder="Search username…"
                      className={commonInputField}
                    />
                  </Field>
                  <Field icon={FiMail} label="Email">
                    <input
                      type="email"
                      name="email"
                      value={filters.email}
                      onChange={set}
                      placeholder="Search email…"
                      className={commonInputField}
                    />
                  </Field>
                </div>
                <div className="md:flex w-full gap-2">
                  <Field icon={FiPhone} label="Phone">
                    <input
                      type="tel"
                      name="phone"
                      value={filters.phone}
                      onChange={set}
                      placeholder="Search phone…"
                      className={commonInputField}
                    />
                  </Field>
                  <Field icon={FiShield} label="Role">
                    <select
                      name="role"
                      value={filters.role}
                      onChange={set}
                      className={
                        commonInputField +
                        " appearance-none cursor-pointer pr-6"
                      }
                    >
                      <option value="all">All roles</option>
                      {roles.map((role, i) => (
                        <option key={`roleform${i}`} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-2.5 text-emerald-700/50 pointer-events-none text-[10px]">
                      ▾
                    </span>
                  </Field>
                </div>
              </div>

              <div className="h-px bg-emerald-300/40" />

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/50">
                  Sort by
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {SORT_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFilters((p) => ({ ...p, sortBy: opt.value }))
                      }
                      className="py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                      style={
                        filters.sortBy === opt.value
                          ? {
                              background: PALETTE.mint,
                              color: "white",
                              boxShadow: "0 2px 6px rgba(47,160,132,0.3)",
                            }
                          : {
                              background: "rgba(255,255,255,0.5)",
                              color: "#065f46",
                              border: "1px solid rgba(52,211,153,0.35)",
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-emerald-300/40" />

              <div className="flex flex-col gap-1.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={primaryButton}
                  onClick={() => onApply(filters)}
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
                    boxShadow: "0 3px 10px rgba(47,160,132,0.35)",
                  }}
                >
                  <FiSearch size={12} /> Apply Filter
                </motion.button>
                <button
                  type="button"
                  onClick={reset}
                  className={secondaryButton}
                >
                  <FiRotateCcw size={11} /> Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
export default AccountsFilterForm;
