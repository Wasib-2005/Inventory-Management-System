import { useState } from "react";
import { commonInputField } from "../../Theme/commonInputField";
import { EyeClosedIcon, EyeIcon } from "@animateicons/react/lucide";

const EyeIconComponent = ({ open }) =>
  open ? (
    <EyeIcon size={20} duration={1.1} color="#000000" />
  ) : (
    <EyeClosedIcon size={20} duration={1} color="#000000" />
  );

/**
 * PasswordInput
 * @param {string} name        - input name attribute
 * @param {string} placeholder - input placeholder
 * @param {string} autoComplete - autocomplete attribute
 * @param {"lock"|"check"} iconVariant - which left icon to show
 */
const PasswordInput = ({
  name,
  placeholder = "••••••••",
  autoComplete = "current-password",
  value, // ← add
  onChange, // ← add
  disabled, // ← add
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value} // ← add
        onChange={onChange} // ← add
        disabled={disabled} // ← add
        className={`${commonInputField} pr-8`}
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 flex items-center text-[#40514E]/35 hover:text-[#11999E] transition-colors"
      >
        <EyeIconComponent open={show} />
      </button>
    </div>
  );
};

export default PasswordInput;
