import { useContext, useState, useRef } from "react";
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "../../Theme/palette";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import axios from "axios";
import { primaryButton } from "../../Theme/primaryButton";
import TimeZoneClock from "../Common/TimeZoneClock";
import NavLinks from "./NavLinks";
import NavProfileLogout from "./NavProfileLogout";
import { MdLogin } from "react-icons/md";

const BASE = import.meta.env.VITE_BACKEND_API_HEADER;

const Nav = () => {
  const [expanded, setExpanded] = useState(false);
  const { user, setUser } = useContext(UserContext);
  
  const hoverTimeoutRef = useRef(null);
  const isMenuOpenRef = useRef(false); 

  const handleMouseEnter = () => {
    // Lock navbar layout width expansion entirely if user is currently interacting with the profile dropdown popover
    if (isMenuOpenRef.current) return;

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setExpanded(true);
    }, 2000); 
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setExpanded(false);
  };

  const handleNavbarClick = () => {
    // Avoid toggling dimensions if the sub dropdown menu action sequence is operational
    if (isMenuOpenRef.current) return;

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setExpanded((prev) => !prev);
  };

  // Helper passed down to clear any ticking hover expansion timeouts instantly on click
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleLogout = async (e) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${BASE}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes marquee-infinite {
          0% { transform: translateX(0%); }
          90% { transform: translateX(-50%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-permanent {
          display: flex;
          width: max-content;
          animation: marquee-infinite 7s linear infinite;
        }
      `}</style>

      {/* Backdrop for mobile interfaces */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10 lg:hidden"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Nav Container */}
      <motion.nav
        animate={{ width: expanded ? "200px" : "78px" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className={`fixed ${!expanded ? "md:top-5" : "md:top-0"} md:left-5 h-full ${
          expanded ? "md:h-screen" : "md:h-[calc(100vh-40px)]"
        } z-50 p-2 md:rounded-l-2xl`}
        style={{
          backgroundColor: PALETTE.bg,
          boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
          cursor: "pointer",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleNavbarClick}
      >
        {/* INNER CONTAINER: Uses overflow-visible when closed so dropdown doesn't clip off-screen */}
        <div
          className={`h-full flex flex-col py-5 bg-gray-300/30 md:rounded-l-xl transition-all ${
            expanded ? "overflow-hidden" : "overflow-visible"
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4 px-2 pointer-events-none">
            <motion.img
              animate={{ width: expanded ? "100px" : "60px" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              src="/logo.png"
              alt="Logo"
            />
          </div>

          {/* Divider */}
          <div
            className="mx-3.5 h-px shrink-0"
            style={{ backgroundColor: PALETTE.steel }}
          />
          <div className="my-2 flex mx-auto">
            <TimeZoneClock permanent12hIndicator={expanded} />
          </div>
          {/* Divider */}
          <div
            className="mx-3.5 mb-5 h-px shrink-0"
            style={{ backgroundColor: PALETTE.steel }}
          />

          {/* Nav links */}
          <ul className="flex flex-col gap-2 px-3 overflow-auto">
            {NavLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={(e) => e.stopPropagation()}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 p-3 rounded-xl transition-colors duration-300 z-10 ${
                      expanded ? "px-4" : "justify-center"
                    } ${isActive ? "text-cyan-800" : "text-gray-700 hover:bg-[#DFF1F1]/40"}`
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
                      <span title={link.name} className="shrink-0">
                        {link.label}
                      </span>
                      
                      {/* Text links entry */}
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, width: 0, x: -10 }}
                            animate={{ opacity: 1, width: "auto", x: 0 }}
                            exit={{ opacity: 0, width: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full overflow-hidden mask-[linear-gradient(to_right,rgba(0,0,0,1)_85%,rgba(0,0,0,0)_100%)]"
                          >
                            <div
                              className={`whitespace-nowrap text-sm font-medium flex gap-4 ${
                                link.name.length > 14 ? "animate-marquee-permanent" : ""
                              }`}
                            >
                              <span>{link.name}</span>
                              {link.name.length > 14 && <span>{link.name}</span>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {user ? (
            <NavProfileLogout 
              user={user} 
              expanded={expanded} 
              handleLogout={handleLogout} 
              clearHoverTimeout={clearHoverTimeout}
              onDropdownToggle={(isOpen) => {
                isMenuOpenRef.current = isOpen;
              }}
            />
          ) : (
            <NavLink to={"/auth"} className="mt-auto flex justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                className={`m-1 ${primaryButton} text-white ${!expanded && "scale-75"}`}
                style={{
                  background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
                  boxShadow: "0 3px 10px rgba(47,160,132,0.35)",
                  transition: "all 0.3s ease",
                }}
              >
                {expanded ? "Login" : <MdLogin size={20}/>}
              </button>
            </NavLink>
          )}
        </div>
      </motion.nav>
    </>
  );
};

export default Nav;