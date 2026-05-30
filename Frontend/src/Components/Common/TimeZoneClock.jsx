import { useState, useEffect } from "react";

const TimeZoneClock = ({
  permanent12hIndicator = false,
  timeZone = import.meta.env.VITE_TIMEZONE,
}) => {
  const [time, setTime] = useState(new Date());
  const [isHoveredOrClicked, setIsHoveredOrClicked] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Configuration for 24-hour mode (Default)
  const format24h = {
    timeZone: timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // Configuration for 12-hour mode with seconds (On Hover/Click)
  const format12hWithSec = {
    timeZone: timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  // Choose options based on the interaction state
  const options =
    isHoveredOrClicked || permanent12hIndicator ? format12hWithSec : format24h;

  let formattedTime = new Intl.DateTimeFormat("en-US", options).format(time);

  // Lowercase the AM/PM if we are in the 12-hour view
  if (isHoveredOrClicked) {
    formattedTime = formattedTime.toLowerCase();
  }

  return (
    <span
      className="tz-clock"
      style={{ cursor: "pointer", userSelect: "none" }}
      // Desktop Hover Events
      onMouseEnter={() => setIsHoveredOrClicked(true)}
      onMouseLeave={() => setIsHoveredOrClicked(false)}
      // Mobile Click/Touch Events
      onClick={() => setIsHoveredOrClicked(!isHoveredOrClicked)}
    >
      {formattedTime}
    </span>
  );
};

export default TimeZoneClock;
