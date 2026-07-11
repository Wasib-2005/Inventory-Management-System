import { commonInputField } from "../../../../../Theme/commonInputField";
import { UNIT_OPTIONS } from "./constants";

const UnitSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`${commonInputField} cursor-pointer appearance-none bg-no-repeat bg-[right_0.5rem_center]`}
    style={{
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23047857' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundSize: "1.25rem",
    }}
  >
    {UNIT_OPTIONS.map((u) => (
      <option key={u} value={u}>
        {u}
      </option>
    ))}
  </select>
);

export default UnitSelect;
