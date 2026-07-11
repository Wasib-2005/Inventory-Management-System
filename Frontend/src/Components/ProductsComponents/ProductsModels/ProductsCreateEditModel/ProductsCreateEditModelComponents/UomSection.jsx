import { commonInputField } from "../../../../../Theme/commonInputField";
import UnitSelect from "./UnitSelect";

const UomSection = ({ uom, onUnitChange, onConversionFactorChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Base Unit *
        </label>
        <UnitSelect
          value={uom.baseUnit}
          onChange={(v) => onUnitChange("baseUnit", v)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Sales Unit
        </label>
        <UnitSelect
          value={uom.salesUnit}
          onChange={(v) => onUnitChange("salesUnit", v)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Purchase Unit
        </label>
        <UnitSelect
          value={uom.purchaseUnit}
          onChange={(v) => onUnitChange("purchaseUnit", v)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Conversion Factor
        </label>
        <input
          type="text"
          value={uom.conversionFactor}
          onChange={(e) => onConversionFactorChange(e.target.value)}
          className={commonInputField}
        />
      </div>
    </div>
  );
};

export default UomSection;
