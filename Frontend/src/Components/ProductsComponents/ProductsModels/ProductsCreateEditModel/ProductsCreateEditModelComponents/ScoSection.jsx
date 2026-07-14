import { commonInputField } from "../../../../../Theme/commonInputField";

const SeoSection = ({ seo, onChange }) => {
  // Safe string fallbacks to keep HTML inputs stable and controlled
  const { metaTitle = "", metaDescription = "", keywords = "" } = seo || {};

  return (
    <div className="flex flex-col gap-4 border-t border-emerald-100/60 pt-4">
      <div>
        <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
          SEO Configuration
        </h3>
        <p className="text-[11px] text-emerald-600/70">
          Optimize how this product appears on search engines and social shares.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Meta Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Meta Title
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            placeholder="e.g. Premium Wireless Headphones | Brand Name"
            className={commonInputField}
          />
          <div className="flex justify-between text-[10px] text-emerald-600/60 px-0.5">
            <span>Recommended: 50-60 characters</span>
            <span className={metaTitle.length > 60 ? "text-amber-600 font-medium" : ""}>
              {metaTitle.length} chars
            </span>
          </div>
        </div>

        {/* Meta Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            placeholder="Write a catchy summary of the product to maximize search click-through rates..."
            rows={3}
            className={`${commonInputField} py-2 resize-none`}
          />
          <div className="flex justify-between text-[10px] text-emerald-600/60 px-0.5">
            <span>Recommended: 150-160 characters</span>
            <span className={metaDescription.length > 160 ? "text-amber-600 font-medium" : ""}>
              {metaDescription.length} chars
            </span>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-emerald-700/70 font-semibold uppercase">
            Keywords
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => onChange("keywords", e.target.value)} 
            placeholder="e.g. wireless, headphones, bluetooth, audio"
            className={commonInputField}
          />
          <p className="text-[10px] text-emerald-600/50 px-0.5">
            Separate search keywords or phrases with commas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeoSection;