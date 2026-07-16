import axios from "axios";
import { useEffect, useState } from "react";
import { commonInputField } from "../../../Theme/commonInputField";

const Role = ({ name, value, onChange, disabled, editable }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const getRoles = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/roles/get`,
      );
      setRoles(response.data);
    };

    getRoles();
  }, []);
  return (
    <select
      name={name}
      value={value || "user"}
      onChange={onChange}
      disabled={disabled}
      readOnly={!editable}
      className={`${commonInputField} w-full disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default`}
    >
      {roles.map((role) => (
        <option key={role} value={role} default={role === "user"}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default Role;
