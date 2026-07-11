import { commonInputField } from "../../../../../Theme/commonInputField";

const ComplianceSection = ({ compliance, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          HSN Code
        </label>
        <input
          type="text"
          value={compliance.hsnCode}
          onChange={(e) => onChange(e, "compliance", "hsnCode")}
          className={commonInputField}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Country of Origin
        </label>
        <input
          type="text"
          value={compliance.countryOfOrigin}
          onChange={(e) => onChange(e, "compliance", "countryOfOrigin")}
          className={commonInputField}
        />
      </div>
    </div>
  );
};

export default ComplianceSection;
