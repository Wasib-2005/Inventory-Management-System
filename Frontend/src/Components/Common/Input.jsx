import { useState } from "react";
import { commonInputField } from "../../Theme/commonInputField";
import PasswordInput from "./PasswordInput"; // Adjust this path to your password file

const Input = ({ label, value: initialValue }) => {
  // 1. Maintain local state so the fields can be typed into without 'readOnly' lockouts
  const [currentValue, setCurrentValue] = useState(initialValue);

  const handleChange = (e) => {
    // Handles both normal inputs and checkbox toggles
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setCurrentValue(val);
  };

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

    case "string":
    default:
      // Passwords → Now uses your custom interactive PasswordInput component
      if (label.toLowerCase() === "password") {
        return (
          <div className="w-full">
            <PasswordInput
              name={label}
              placeholder="Enter password..."
              value={currentValue ?? ""}
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
        // Strip down ISO timestamp strings ("YYYY-MM-DDTHH:mm...") to clean date strings ("YYYY-MM-DD")
        const dateString =
          typeof currentValue === "string" ? currentValue.substring(0, 10) : "";
        return (
          <input
            type="date"
            value={dateString}
            onChange={handleChange}
            className={`${commonInputField} w-full`}
          />
        );
      }

      // Standard Text Fallback
      return (
        <input
          type="text"
          value={currentValue ?? ""}
          onChange={handleChange}
          className={`${commonInputField} w-full`}
        />
      );
  }
};

export default Input;
