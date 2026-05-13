import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { NavLink } from "react-router";
import { motion } from "framer-motion";
import { PALETTE } from "../Theme/palette";

const navLinks = [
  { label: <FaHome size={18} />, path: "/", name: "Home" },
  {
    label: <IoPersonSharp size={18} />,
    path: "/accounts-and-permissions",
    name: "Accounts & Permission",
  },
];

const Nav = () => {
  const [expanded, setExpanded] = useState(false);

  // Toggle function for touch/click
  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <>
      {/* Overlay: Closes the sidebar when tapping outside on mobile */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/10 lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <nav
        className={`fixed ${!expanded && "md:top-5"} md:left-5 h-full  ${expanded ? "md:h-[calc(100vh)]" : "md:h-[calc(100vh-40px)]"} z-50 p-2 md:rounded-l-2xl`}
        style={{
          width: expanded ? "200px" : "78px",
          backgroundColor: PALETTE.bg,
          boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
          cursor: "pointer", // Indicates it's interactive
        }}
      >
        <div
          className={`h-full ${expanded ? "md:h-[calc(100vh-15px)]" : "md:h-[calc(100vh-57px)]"} flex flex-col py-5 transition-all duration-300 ease-in-out overflow-hidden bg-gray-300/30 md:rounded-l-xl`}
          // Desktop Hover
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          // Touch/Mobile Toggle
          onClick={handleToggle}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4 px-2 pointer-events-none">
            <img
              className={expanded ? "w-[100px]" : "w-[60px]"}
              style={{ transition: "width 0.3s ease-in-out" }}
              src="/logo.png"
              alt="Logo"
            />
          </div>

          {/* Divider */}
          <div
            className="mx-[14px] mb-5 h-px flex-shrink-0"
            style={{ backgroundColor: PALETTE.steel }}
          />

          {/* Nav links */}
          <ul className="flex flex-col gap-2 px-3">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={(e) => e.stopPropagation()}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 p-3 rounded-xl transition-colors duration-300 z-10
           ${expanded ? "px-4" : "justify-center"}
           ${isActive ? "text-cyan-800" : "text-gray-700 hover:bg-[#DFF1F1]/40"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 rounded-xl bg-[#DFF1F1] shadow-sm -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      <span title={link.name} className="flex-shrink-0">
                        {link.label}
                      </span>

                      {expanded && (
                        <motion.span
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="whitespace-nowrap overflow-hidden text-sm font-medium"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Nav;
