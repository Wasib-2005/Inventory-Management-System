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

// Animated Burger Icon Sub-Component
const AnimatedBurger = ({ isOpen }) => {
  return (
    <div className="w-6 h-5 flex flex-col justify-between items-center relative">
      <motion.span
        animate={isOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-6 h-[2.5px] bg-gray-700 rounded-full origin-center"
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }}
        className="w-6 h-[2.5px] bg-gray-700 rounded-full"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-6 h-[2.5px] bg-gray-700 rounded-full origin-center"
      />
    </div>
  );
};

const Nav = () => {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  
  const hoverTimeoutRef = useRef(null);
  const isMenuOpenRef = useRef(false); 

  const handleMouseEnter = () => {
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
    if (isMenuOpenRef.current) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setExpanded((prev) => !prev);
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleLogout = async (e) => {
    if (e) e.stopPropagation();
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

      {/* ========================================================= */}
      {/* 1. SMALL DEVICES TOP NAVBAR (< md)                        */}
      {/* ========================================================= */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 md:hidden border-b border-gray-200/50"
        style={{
          backgroundColor: PALETTE.bg,
          boxShadow: "0 2px 12px rgba(187,213,218,0.3)",
        }}
      >
        {/* Left: Icon / Logo */}
        <div className="flex items-center shrink-0">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
        </div>

        {/* Middle: 12-Hour Clock */}
        <div className="flex items-center justify-center">
          <TimeZoneClock permanent12hIndicator={true} />
        </div>

        {/* Right: Animated Burger Menu Button */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="p-2 text-gray-700 hover:text-cyan-800 transition-colors rounded-lg focus:outline-none flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <AnimatedBurger isOpen={mobileOpen} />
        </button>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed top-[53px] left-0 right-0 z-40 p-4 shadow-xl md:hidden rounded-b-2xl"
              style={{ backgroundColor: PALETTE.bg }}
            >
              <div className="flex flex-col gap-3 bg-gray-300/30 p-3 rounded-xl max-h-[calc(100vh-80px)] overflow-y-auto">
                <ul className="flex flex-col gap-2">
                  {NavLinks.map((link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 ${
                            isActive
                              ? "bg-[#DFF1F1] text-cyan-800 font-semibold shadow-sm"
                              : "text-gray-700 hover:bg-[#DFF1F1]/40"
                          }`
                        }
                      >
                        <span className="shrink-0">{link.label}</span>
                        <span className="text-sm font-medium">{link.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div
                  className="my-1 h-px w-full"
                  style={{ backgroundColor: PALETTE.steel }}
                />

                {user ? (
                  <NavProfileLogout
                    user={user}
                    expanded={true}
                    handleLogout={(e) => {
                      handleLogout(e);
                      setMobileOpen(false);
                    }}
                    clearHoverTimeout={clearHoverTimeout}
                    onDropdownToggle={(isOpen) => {
                      isMenuOpenRef.current = isOpen;
                    }}
                  />
                ) : (
                  <NavLink
                    to={"/auth"}
                    onClick={() => setMobileOpen(false)}
                    className="flex justify-center w-full"
                  >
                    <button
                      className={`w-full py-2.5 ${primaryButton} text-white flex justify-center items-center gap-2`}
                      style={{
                        background: `linear-gradient(135deg, ${PALETTE.mint}, ${PALETTE.steelDark})`,
                        boxShadow: "0 3px 10px rgba(47,160,132,0.35)",
                      }}
                    >
                      <MdLogin size={20} />
                      <span>Login</span>
                    </button>
                  </NavLink>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. MEDIUM & LARGE DEVICES SIDEBAR (>= md)                 */}
      {/* ========================================================= */}
      <motion.nav
        animate={{ width: expanded ? "200px" : "78px" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className={`hidden md:block fixed ${!expanded ? "md:top-5" : "md:top-0"} md:left-5 h-full ${
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