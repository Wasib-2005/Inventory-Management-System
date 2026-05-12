import { useState } from "react";
import { PALETTE } from "../Service/palette";
import { FaHome } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { NavLink } from "react-router";

const navLinks = [
  { label: <FaHome size={18} />, path: "/", name: "Home" },
  { label: <IoPersonSharp size={18} />, path: "/accounts", name: "Accounts" },
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
          className="fixed inset-0 z-40 bg-black/5 lg:hidden" 
          onClick={() => setExpanded(false)}
        />
      )}

      <nav
        className="fixed top-0 left-0 h-screen z-50 flex flex-col py-5
                   transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          width: expanded ? "200px" : "72px",
          backgroundColor: PALETTE.bg,
          borderRight: `1px solid ${PALETTE.steel}`,
          boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
          cursor: "pointer" // Indicates it's interactive
        }}
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
                // Stop propagation so clicking a link doesn't 
                // immediately trigger the nav's toggle logic twice
                onClick={(e) => e.stopPropagation()}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                   ${expanded ? "px-4" : "justify-center"}
                   ${
                     isActive
                       ? "bg-[#DFF1F1] shadow-sm text-cyan-800"
                       : "bg-white text-gray-700 hover:bg-[#DFF1F1]/40"
                   }`
                }
              >
                <span title={link.name} className="flex-shrink-0">
                  {link.label}
                </span>
                {expanded && (
                  <span className="whitespace-nowrap overflow-hidden text-sm font-medium">
                    {link.name}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Nav;