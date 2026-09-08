import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router";

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, scale: 0.99, filter: "blur(4px)" },
};

const AnimatedPage = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location.pathname}${location.search}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}
        className="page-transition flex min-h-0 flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedPage;
