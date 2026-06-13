import { useState, useEffect } from "react";
import {
  EMP_TYPE_OPTIONS,
  EMP_STATUS_OPTIONS,
  GENDER_OPTIONS,
  getRole,
} from "../../data/helpers";
import { commonInputField } from "../../../../Theme/commonInputField";

const EditField = ({
  label,
  fieldKey,
  value,
  editing,
  onChange,
  type = "text",
  required = false,
}) => {
  const [selectOptions, setSelectOptions] = useState({
    roleTitle: [],
    employmentType: EMP_TYPE_OPTIONS,
    employmentStatus: EMP_STATUS_OPTIONS,
    gender: GENDER_OPTIONS,
  });

  // Local state to track number validation errors
  const [error, setError] = useState("");

  const isSelect = fieldKey in selectOptions;

  useEffect(() => {
    if (fieldKey !== "roleTitle") return;
    const fetchRoles = async () => {
      try {
        const roles = await getRole();
        setSelectOptions((prev) => ({ ...prev, roleTitle: roles }));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, [fieldKey]);

  // Handle input and error states cleanly
  const handleInputChange = (e) => {
    const val = e.target.value;
    
    if (type === "number") {
      // Check if the input is not empty and is not a valid number
      if (val !== "" && isNaN(Number(val))) {
        setError("Please give a number");
      } else {
        setError(""); // Clear error if it's a valid number or empty
      }
    }
    
    onChange(fieldKey, val);
  };

  const getDisplayValue = () => {
    if (type === "date" && value) return value.slice(0, 10);
    if (type === "number") return value !== undefined && value !== "" ? value : 0;
    return value || "—";
  };

  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-dashed border-(--color-border-tertiary) last:border-b-0">
      {label && (
        <span className="text-[12px] font-bold text-(--color-text-tertiary) uppercase tracking-wide">
          {label}
        </span>
      )}
      {editing ? (
        isSelect ? (
          <select
            className={commonInputField}
            value={value ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
          >
            {fieldKey === "roleTitle" && <option value="">Select role</option>}
            {selectOptions[fieldKey].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex flex-col w-full">
            <input
              className={`${type === "number" && "text-right"} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${commonInputField}`}
              // We use "text" type for numbers so the browser lets users type mistakes, allowing us to show the error message
              type={type === "number" ? "text" : type}
              value={type === "date" && value ? value.slice(0, 10) : (value ?? "")}
              onChange={handleInputChange}
              required={required}
            />
            
            {/* Error Message Displayed Directly Under Input */}
            {type === "number" && error && (
              <span className={`text-[12px] text-red-500 mt-1 font-medium ${type === "number" && "text-right"}`}>
                {error}
              </span>
            )}
          </div>
        )
      ) : (
        <span
          className={`text-[14px] ${!value && type !== "number" ? "text-(--color-text-tertiary)" : "text-(--color-text-primary)"}`}
        >
          {getDisplayValue()}
        </span>
      )}
    </div>
  );
};

export default EditField;