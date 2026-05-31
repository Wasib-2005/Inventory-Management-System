import {  useEffect, useState } from "react";
import { commonInputField } from "../../../Theme/commonInputField";
import PasswordInput from "./PasswordInput";
import Role from "./Role";

const Input = ({
  label,
  value: initialValue = "",
  showValue = false,
  editable = true,
  disabled = false,
  successfulSubmission = false,
}) => {
  const [currentValue, setCurrentValue] = useState(
    showValue
      ? (initialValue ?? "")
      : typeof initialValue === "boolean"
        ? false
        : "",
  );

  useEffect(() => {
    if (successfulSubmission) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentValue(
        showValue
          ? (initialValue ?? "")
          : typeof initialValue === "boolean"
            ? false
            : "",
      );
    }
  }, [successfulSubmission, initialValue, showValue]);

  const handleChange = (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setCurrentValue(val);
  };

  // Boolean — triggered when initialValue is a boolean
  // Boolean — Switch
  if (typeof currentValue === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input type="hidden" name={label} value={currentValue.toString()} />
        <button
          type="button"
          role="switch"
          aria-checked={currentValue}
          onClick={() =>
            !disabled && editable && setCurrentValue(!currentValue)
          }
          disabled={disabled}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
    ${currentValue ? "bg-blue-600" : "bg-gray-300"}
    ${disabled ? "opacity-50 cursor-not-allowed" : editable ? "cursor-pointer" : "cursor-default"}
  `}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200
      ${currentValue ? "translate-x-4" : "translate-x-1"}
    `}
          />
        </button>
        <span className="text-xs text-gray-500">
          {currentValue ? "Active / Enabled" : "Inactive / Disabled"}
        </span>
      </div>
    );
  }

  // Password
  if (label.toLowerCase() === "password") {
    return (
      <div className="w-full">
        <PasswordInput
          name={label}
          placeholder="Enter password..."
          value={currentValue ?? ""}
          onChange={handleChange}
          disabled={disabled}
          readOnly={!editable}
        />
      </div>
    );
  }

  // Employment Type
  if (label.toLowerCase().includes("employmenttype")) {
    return (
      <select
        name={label}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={!editable}
        className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
      >
        <option value="">Select employment type</option>
        <option value="full-time">Full-time</option>
        <option value="part-time">Part-time</option>
        <option value="intern">Intern</option>
        <option value="consultant">Consultant</option>
        <option value="contractor">Contractor</option>
      </select>
    );
  }

  // Employment Status
  if (label.toLowerCase().includes("employmentstatus")) {
    return (
      <select
        name={label}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={!editable}
        className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
      >
        <option value="">Select employment status</option>
        <option value="active">Active</option>
        <option value="on-leave">On Leave</option>
        <option value="terminated">Terminated</option>
      </select>
    );
  }

  // Date
  if (
    label.toLowerCase().includes("date") ||
    label.toLowerCase().includes("changed") ||
    label.toLowerCase().includes("updated") ||
    label.toLowerCase().includes("birth") ||
    label.toLowerCase().includes("hire")
  ) {
    if (
      label.toLowerCase().includes("changed") ||
      label.toLowerCase().includes("updated") ||
      // label.toLowerCase().includes("birth") ||
      label.toLowerCase().includes("hire")
    ) {
      const dateString =
        typeof currentValue === "string" ? initialValue.substring(0, 10) : "";
      return (
        <input
          type="date"
          name={label}
          value={dateString} //show the date no meter what
          onChange={handleChange} //wont change so remove it
          disabled={true}
          readOnly={true}
          className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
        />
      );
    }
    const dateString =
      typeof currentValue === "string" ? currentValue.substring(0, 10) : "";
    return (
      <input
        type="date"
        name={label}
        value={dateString}
        onChange={handleChange}
        disabled={disabled}
        readOnly={!editable}
        className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
      />
    );
  }

  // Gender
  if (label.toLowerCase().includes("gender")) {
    return (
      <select
        name={label}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={!editable}
        className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    );
  }

  // Roles
  if (label.toLowerCase() === "role") {
    return (
      <Role
        name={label}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={!editable}
      />
    );
  }

  // Disable inputs
  if (label.toLowerCase().includes("timezone") ) {
    return (
      <input
        type="text"
        name={label}
        value={currentValue ?? ""}
        disabled={true}
        readOnly={true}
        className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
      />
    );
  } 


  // Text
  return (
    <input
      type="text"
      name={label}
      type={label.toLowerCase().includes("email") ? "email" : "text"}
      value={currentValue ?? ""}
      onChange={handleChange}
      disabled={disabled}
      readOnly={!editable}
      className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
    />
  );
};

export default Input;
