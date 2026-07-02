import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IconActionButton = ({
  icon: Icon,
  label,
  onClick,
  className = "",
  iconSize = 16,
  tooltipPosition = "bottom",
}) => {
  const [show, setShow] = useState(false);
  const hideTimer = useRef(null);

  const handleClick = (e) => {
    setShow(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShow(false), 1400);
    onClick?.(e);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button type="button" onClick={handleClick} className={className}>
        <Icon size={iconSize} />
      </button>

      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: tooltipPosition === "top" ? 4 : -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === "top" ? 4 : -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-30 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold shadow-lg pointer-events-none ${
              tooltipPosition === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconActionButton;