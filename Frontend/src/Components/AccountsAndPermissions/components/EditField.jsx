import { useEffect, useState } from "react";
import {
  EMP_TYPE_OPTIONS,
  EMP_STATUS_OPTIONS,
  GENDER_OPTIONS,
  getRole,
} from "../data/helpers";
import { commonInputField } from "../../../Theme/commonInputField";


const EditField = ({
  label,
  fieldKey,
  value,
  editing,
  onChange,
  type = "text",
}) => {
  const [selectOptions, setSelectOptions] = useState({
    role: ["user"],
    empType: EMP_TYPE_OPTIONS,
    empStatus: EMP_STATUS_OPTIONS,
    gender: GENDER_OPTIONS,
  });

  const isSelect = fieldKey in selectOptions;

  useEffect(() => {
    // 1. Define the async function inside the effect
    const fetchRoles = async () => {
      try {
        const roles = await getRole();
        setSelectOptions((prev) => ({ ...prev, role: roles }));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    // 2. Call it immediately
    fetchRoles();
  }, []);

  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-(--color-border-tertiary) last:border-b-0">
      <span className="text-[11px] font-medium text-(--color-text-tertiary) uppercase tracking-wide">
        {label}
      </span>

      {editing ? (
        isSelect ? (
          <select
            className={commonInputField}
            value={value ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
          >
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
            value={value ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
          />
        )
      ) : (
        <span
          className={`text-[13px] ${!value ? "text-(--color-text-tertiary)" : "text-(--color-text-primary)"}`}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
};

export default EditField;