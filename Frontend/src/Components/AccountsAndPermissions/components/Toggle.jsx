const Toggle = ({ value, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    disabled={disabled}
    onClick={() => !disabled && onChange(!value)}
    className={`relative inline-flex w-8 h-[18px] rounded-full border transition-colors duration-200 shrink-0
      ${value ? "bg-[#1D9E75] border-[#0F6E56]" : "bg-gray-500 border-(--color-border-secondary)"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <span
      className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform duration-200
        ${value ? "translate-x-[14px]" : "translate-x-0"}`}
    />
  </button>
);

export default Toggle;
