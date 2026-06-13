const Tooltip = ({ children, text, position = "top", show = true }) => {
  // Define positioning and animation configurations for each direction
  const positionClasses = {
    top: {
      box: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom translate-y-1 group-hover:translate-y-0",
      arrow: "top-full left-1/2 -translate-x-1/2 border-t-gray-900",
    },
    bottom: {
      box: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top -translate-y-1 group-hover:translate-y-0",
      arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900", // Fixed missing arrow
    },
    left: {
      box: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right translate-x-1 group-hover:translate-x-0",
      arrow: "left-full top-1/2 -translate-y-1/2 border-l-gray-900",
    },
    right: {
      box: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left -translate-x-1 group-hover:translate-x-0",
      arrow: "right-full top-1/2 -translate-y-1/2 border-r-gray-900",
    },
  };

  const currentPosition = positionClasses[position] || positionClasses.top;

  return (
    <div className="group relative inline-block">
      {/* The trigger element (Button, Icon, Text, etc.) */}
      {children}

      {/* The Tooltip Box */}
      <span
        className={`invisible ${!show ? "hidden" : ""} group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 ease-out absolute w-max max-w-xs px-2.5 py-1.5 text-xs text-white bg-gray-900 rounded-md shadow-lg pointer-events-none z-[250] ${currentPosition.box}`} 
      >
        {text}

        {/* Small Arrow/Caret */}
        <span
          className={`absolute border-4 border-transparent ${currentPosition.arrow}`}
        ></span>
      </span>
    </div>
  );
};

export default Tooltip;