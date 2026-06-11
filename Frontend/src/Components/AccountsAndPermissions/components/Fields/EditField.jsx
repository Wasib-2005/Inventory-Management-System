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

  const displayValue =
    type === "date" && value ? value.slice(0, 10) : (value ?? "");

  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-(--color-border-tertiary) last:border-b-0">
      <span className="text-[12px] font-bold text-(--color-text-tertiary) uppercase tracking-wide">
        {label}
      </span>
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
          <input
            className={commonInputField}
            type={type}
            value={displayValue}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            required={required}
          />
        )
      ) : (
        <span
          className={`text-[14px] ${!value ? "text-(--color-text-tertiary)" : "text-(--color-text-primary)"}`}
        >
          {type === "date" && value ? value.slice(0, 10) : value || "—"}
        </span>
      )}
    </div>
  );
};

export default EditField;
