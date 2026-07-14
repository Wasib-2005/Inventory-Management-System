import { commonInputField } from "../../../../../Theme/commonInputField";
import { STATUS_OPTIONS } from "./constants";

const BasicInfoSection = ({ formData, errors, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Product Name
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange(e, "name")}
          className={commonInputField}
        />
        {errors.name && (
          <p className="text-[11px] text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          SKU
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) => onChange(e, "sku")}
          className={commonInputField}
        />
        {errors.sku && <p className="text-[11px] text-red-500">{errors.sku}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Display ID
          <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.displayId}
          onChange={(e) => onChange(e, "displayId")}
          className={commonInputField}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Brand
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => onChange(e, "brand")}
          className={commonInputField}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => onChange(e, "status")}
          className={`${commonInputField} cursor-pointer`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BasicInfoSection;
