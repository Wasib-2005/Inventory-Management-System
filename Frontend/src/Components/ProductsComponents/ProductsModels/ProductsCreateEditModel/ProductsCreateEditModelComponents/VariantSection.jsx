import { FiPlus, FiX } from "react-icons/fi";
import { commonInputField } from "../../../../../Theme/commonInputField";

const VariantSection = ({
  isVariant,
  onToggleVariant,
  parentProductId,
  onParentProductIdChange,
  parentProductIdError,
  variantAttributes,
  onRemoveVariantAttr,
  newVariantAttrKey,
  setNewVariantAttrKey,
  newVariantAttrValue,
  setNewVariantAttrValue,
  onAddVariantAttr,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-white border border-emerald-200 flex flex-col gap-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isVariant}
          onChange={(e) => onToggleVariant(e.target.checked)}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-emerald-800 font-semibold uppercase text-xs tracking-wider">
          This is a variant of another product
        </span>
      </label>

      {isVariant && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
              Parent Product ID *
            </label>
            <input
              type="text"
              placeholder="Paste the parent product's _id"
              value={parentProductId || ""}
              onChange={(e) => onParentProductIdChange(e.target.value)}
              className={commonInputField}
            />
            {parentProductIdError && (
              <p className="text-[11px] text-red-500">{parentProductIdError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VariantSection;
