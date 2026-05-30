import { useState } from "react";
import { commonInputField } from "../../Theme/commonInputField";
import PasswordInput from "./PasswordInput"; 

const Input = ({ label, value: initialValue = "", showValue = false }) => {
  // 1. Maintain local state initialized with type safety
  const [currentValue, setCurrentValue] = useState(() => {
    if (typeof initialValue === "number" && isNaN(initialValue)) return "";
    return initialValue ?? "";
  });

  const handleChange = (e) => {
    const target = e.target;
    
    // Checkbox boolean logic
    if (target.type === "checkbox") {
      setCurrentValue(target.checked);
      return;
    }

    // Strict Number Validation: Ensures a string doesn't sneak into a number state
    if (target.type === "number") {
      const parsedValue = target.value === "" ? "" : Number(target.value);
      setCurrentValue(parsedValue);
      return;
    }

    // Default String handling
    setCurrentValue(target.value);
  };

  // Determine the type strictly based on the current state's variable type
  switch (typeof currentValue) {
    case "boolean":
      return (
        <div className="flex items-center h-8 w-full">
          <input
            type="checkbox"
            checked={currentValue}
            onChange={handleChange}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
          />
          <span className="ml-2 text-xs text-gray-500">
            {currentValue ? "Active / Enabled" : "Inactive / Disabled"}
          </span>
        </div>
      );

    case "number":
      return (
        <input
          type="number"
          // If showValue is false, we mask it by clearing the display value
          value={showValue ? currentValue : ""}
          onChange={handleChange}
          className={`${commonInputField} w-full`}
        />
      );

    case "string":
    default:
      // Passwords
      if (label.toLowerCase().includes("password")) {
        return (
          <div className="w-full">
            <PasswordInput
              name={label}
              placeholder="Enter password..."
              value={showValue ? currentValue : ""}
              onChange={handleChange}
            />
          </div>
        );
      }

      // Dates and Timestamps
      if (
        label.toLowerCase().includes("date") ||
        label.toLowerCase().includes("at")
      ) {
        const dateString = typeof currentValue === "string" ? currentValue.substring(0, 10) : "";
        return (
          <input
            type="date"
            value={showValue ? dateString : ""}
            onChange={handleChange}
            className={`${commonInputField} w-full`}
          />
        );
      }

      // Standard Text Fallback
      return (
        <input
          type="text"
          value={showValue ? currentValue : ""}
          onChange={handleChange}
          className={`${commonInputField} w-full`}
        />
      );
  }
};

export default Input;