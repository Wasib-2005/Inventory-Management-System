import { useState } from "react";
import { commonInputField } from "../../../Theme/commonInputField";
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
 */
const PasswordInput = ({
  name,
  placeholder = "••••••••",
  autoComplete = "current-password",
  // value,
  onChange,
  disabled,
}) => {
  const [show, setShow] = useState(false);
  const [passwordValue, setPasswordValue] = useState( "");

  // --- CALCULATE STRENGTH DIRECTLY DURING RENDER (No useEffect needed!) ---
  const getPasswordStrength = () => {
    if (!passwordValue || passwordValue.length < 8) {
      return "Too Short";
    }

    const hasUpperCase = /[A-Z]/.test(passwordValue);
    const hasLowerCase = /[a-z]/.test(passwordValue);
    const hasNumbers = /\d/.test(passwordValue);
    const hasNonalphas = /\W/.test(passwordValue);

    const totalPassed = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasNonalphas,
    ].filter(Boolean).length;

    if (totalPassed === 4) return "Strong";
    if (totalPassed >= 2) return "Medium";
    return "Weak";
  };

  const passwordStrength = getPasswordStrength();

  // Map strength to layout configuration
  const strengthMeta = {
    "Too Short": {
      width: "w-1/4",
      color: "bg-gray-300",
      text: "text-gray-400",
      border: "border-gray-300",
    },
    Weak: {
      width: "w-2/4",
      color: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
    },
    Medium: {
      width: "w-3/4",
      color: "bg-yellow-500",
      text: "text-yellow-500",
      border: "border-yellow-500",
    },
    Strong: {
      width: "w-full",
      color: "bg-green-500",
      text: "text-green-500",
      border: "border-green-500",
    },
  }[passwordStrength];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Visual Progress Bar and Text */}
      {passwordValue && (
        <div className="w-full mt-1">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden transition-all duration-300">
            <div
              className={`h-full ${strengthMeta.width} ${strengthMeta.color} transition-all duration-300`}
            />
          </div>

          <p className="text-xs font-semibold mt-1.5">
            Strength:{" "}
            <span className={strengthMeta.text}>{passwordStrength}</span>
          </p>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={passwordValue}
          onChange={(e) => {
            setPasswordValue(e.target.value);
            if (onChange) onChange(e);
          }}
          disabled={disabled}
          className={`${commonInputField} pr-8 w-full ${strengthMeta.border}`}
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
    </div>
  );
};

export default PasswordInput;
