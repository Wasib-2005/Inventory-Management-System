import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router";
import { IoPersonSharp } from "react-icons/io5";
import { CiLogin, CiUser } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import { PALETTE } from "../../Theme/palette";

const NavProfileLogout = ({
  user,
  expanded,
  handleLogout,
  onDropdownToggle,
  clearHoverTimeout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        if (onDropdownToggle) onDropdownToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onDropdownToggle]);


  useEffect(() => {
    if (expanded) {
      setDropdownOpen(false);
      if (onDropdownToggle) onDropdownToggle(false);
    }
  }, [expanded, onDropdownToggle]);

  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); 

    if (clearHoverTimeout) clearHoverTimeout();

    if (!expanded) {
      const nextState = !dropdownOpen;
      setDropdownOpen(nextState);
      if (onDropdownToggle) onDropdownToggle(nextState);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="mt-auto relative w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Divider */}
      <div
        className="mx-3.5 mb-3 h-px shrink-0"
        style={{ backgroundColor: PALETTE.steel }}
      />

      <div
        className={`flex items-center gap-3 p-3 rounded-xl  ${!expanded && "justify-center"}`}
      >
        {/* Avatar Trigger Button */}
        <button
          onClick={handleAvatarClick}
          className="w-8 h-8 rounded-full bg-[#DFF1F1] border border-green-500/40 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-cyan-800 uppercase tracking-wider cursor-pointer focus:outline-none relative z-50 hover:opacity-50"
        >
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : user.displayName ? (
            <span>{user.displayName.trim().slice(0, 2)}</span>
          ) : user.email ? (
            <span>{user.email.trim().slice(0, 2)}</span>
          ) : (
            <IoPersonSharp size={16} className="text-cyan-800" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <>
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1 mask-[linear-gradient(to_right,rgba(0,0,0,1)_85%,rgba(0,0,0,0)_100%)]"
              >
                <NavLink to={"/user"}>
                  <div
                    className={`whitespace-nowrap text-sm font-medium text-gray-700 flex gap-4 hover:opacity-50 ${
                      user?.username?.length > 12
                        ? "animate-marquee-permanent"
                        : ""
                    }`}
                  >
                    <span>{user?.username}</span>
                    {user?.username?.length > 12 && (
                      <>
                        <span className="text-gray-400 select-none">
                          &nbsp;•&nbsp;
                        </span>
                        <span>{user?.username}</span>
                        <span className="text-gray-300 select-none">
                          &nbsp;•&nbsp;
                        </span>
                      </>
                    )}
                  </div>
                </NavLink>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleLogout}
                title="Log out"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 border border-red-500 p-1 rounded-full transition-colors duration-200 shrink-0 z-50 cursor-pointer"
              >
                <CiLogin size={18} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING DROPDOWN POPUP MENU (Visible only when Sidebar is Collapsed) */}
      <AnimatePresence>
        {dropdownOpen && !expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -15 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -15 }}
            transition={{ duration: 0.12 }}
            className="fixed left-24 bottom-10 w-44 rounded-xl p-1.5 shadow-2xl border border-gray-100 flex flex-col gap-1"
            style={{ backgroundColor: PALETTE.bg, zIndex: 9999 }}
          >
            {/* Header context */}
            <div className="px-2.5 py-1.5 text-xs font-semibold text-gray-400 truncate border-b border-gray-100 mb-1">
              {user?.username || "Account"}
            </div>

            {/* View Profile Option */}
            <NavLink
              to="/user"
              onClick={() => {
                setDropdownOpen(false);
                if (onDropdownToggle) onDropdownToggle(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-gray-700 hover:bg-[#DFF1F1]/50 rounded-lg transition-colors duration-200"
            >
              <CiUser size={18} className="text-cyan-800" />
              <span>Profile</span>
            </NavLink>

            {/* Log Out Option */}
            <button
              onClick={(e) => {
                setDropdownOpen(false);
                if (onDropdownToggle) onDropdownToggle(false);
                handleLogout(e);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left transition-colors duration-200 cursor-pointer w-full"
            >
              <CiLogin size={18} />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavProfileLogout;
