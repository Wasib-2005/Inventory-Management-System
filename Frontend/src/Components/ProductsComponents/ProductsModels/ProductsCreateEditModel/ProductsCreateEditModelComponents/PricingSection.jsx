import { commonInputField } from "../../../../../Theme/commonInputField";

const currencySymbol = import.meta.env.VITE_CURRENCY_SYMBOL;

const PricingSection = ({ pricing, errors, onPriceChange }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <div className="flex flex-col gap-1 md:w-[35%]">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Sell Price & % *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={pricing.sellPrice}
                onChange={(e) => onPriceChange(e, "sellPrice")}
                className={commonInputField}
              />
              <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                {currencySymbol}
              </span>
            </div>
            <div className="relative w-15">
              <input
                type="text"
                value={pricing.sellPricePercentage || ""}
                onChange={(e) => onPriceChange(e, "sellPricePercentage")}
                className={commonInputField}
              />
              <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>
          {errors.sellPrice && (
            <p className="text-[11px] text-red-500">{errors.sellPrice}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:w-[35%]">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Buy Price & %
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={pricing.buyPrice}
                onChange={(e) => onPriceChange(e, "buyPrice")}
                className={commonInputField}
              />
              <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                {currencySymbol}
              </span>
            </div>
            <div className="relative w-15">
              <input
                type="text"
                value={pricing.buyPricePercentage || ""}
                onChange={(e) => onPriceChange(e, "buyPricePercentage")}
                className={commonInputField}
              />
              <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:w-[30%]">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            MRP *
          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={pricing.mrp}
              onChange={(e) => onPriceChange(e, "mrp")}
              className={commonInputField}
            />
            <span className="absolute inset-y-0 right-2.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
              {currencySymbol}
            </span>
          </div>
          {errors.mrp && (
            <p className="text-[11px] text-red-500">{errors.mrp}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 sm:w-[200px]">
        <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
          Tax Rate %
        </label>
        <input
          type="text"
          value={pricing.taxRatePercentage}
          onChange={(e) => onPriceChange(e, "taxRatePercentage")}
          className={commonInputField}
        />
      </div>
    </>
  );
};

export default PricingSection;
