import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any value (string, object, etc.)
 * @param {*} value - The changing state value you want to debounce
 * @param {number} delay - The delay in milliseconds (defaults to 400ms)
 * @returns {*} - The stable, debounced value
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay finishes.
    // This cancels the previous pending API call execution!
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;