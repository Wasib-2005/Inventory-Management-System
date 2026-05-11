import { useState } from "react";

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
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
  iconVariant = "lock",
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center">
      {/* Left icon */}
      <svg
        className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {iconVariant === "check" ? (
          <>
            <rect x="3" y="11" width="18" height="11" rx="3" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4M9 16l2 2 4-3" />
          </>
        ) : (
          <>
            <rect x="3" y="11" width="18" height="11" rx="3" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )}
      </svg>

      {/* Input */}
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#11999E]/10 bg-white/75 backdrop-blur-md text-[#40514E] text-sm placeholder:text-[#40514E]/35 outline-none transition-all duration-300 focus:border-[#30E3CA] focus:ring-4 focus:ring-[#30E3CA]/15 focus:bg-white shadow-sm hover:border-[#11999E]/20"
        
      />

      {/* Eye toggle */}
      <button
        type="button"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 flex items-center text-[#40514E]/35 hover:text-[#11999E] transition-colors"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
};

export default PasswordInput;
