import { useState, useEffect } from "react";
import { FiX, FiPackage, FiEdit2, FiTag } from "react-icons/fi";
import { CiBarcode } from "react-icons/ci";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../Theme/secondaryButton";
import { primaryButton } from "../../../Theme/primaryButton";
import {
  resolveImageUrl,
  normalizeCategoryData,
  normalizeSupplierData,
} from "./ProductsCreateEditModel/ProductsCreateEditModelComponents/productAdapters";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200",
  ARCHIVED: "bg-amber-50 text-amber-600 border-amber-200",
  DISCONTINUED: "bg-rose-50 text-rose-600 border-rose-200",
};

const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

const ProductDetailsModel = ({
  isDetailsOpen,
  setIsDetailsOpen,
  productData,
  canEditProduct,
  onEdit,
}) => {
  const [activeImage, setActiveImage] = useState(null);

  const headerImage = productData?.image?.header;
  const extraImages = productData?.image?.extra ?? [];
  const gallery = [headerImage, ...extraImages].filter(Boolean);

  useEffect(() => {
    if (productData) {
      setActiveImage(headerImage);
    }
  }, [productData, headerImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailsOpen, setIsDetailsOpen]);

  if (!isDetailsOpen || !productData) return null;

  const {
    displayId,
    parentProductId,
    barcodes = [],
    name,
    brand,
    status,
    sku,
    categoryData,
    supplierData,
    tags = [],
    uom = {},
    pricing = {},
    compliance = {},
    specifications = [],
    flags = {},
    extraDetails = [],
  } = productData;

  const category = normalizeCategoryData(categoryData);
  const suppliers = normalizeSupplierData(supplierData);
  const close = () => setIsDetailsOpen(false);
  const displayedImage = activeImage || headerImage;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-100 flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                !parentProductId
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}
            >
              {!parentProductId ? "Base" : "Variant"}
            </span>
            {status && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  STATUS_STYLES[status] || STATUS_STYLES.DRAFT
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close details"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/60 rounded-xl p-4 h-64 w-full">
            {displayedImage ? (
              <img
                src={resolveImageUrl(displayedImage)}
                alt={name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                <FiPackage size={48} className="stroke-1" />
                <span className="text-xs font-medium">No Image Available</span>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full justify-start border-b border-slate-100">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(src)}
                  className={`w-14 h-14 rounded-lg p-1 bg-slate-50 overflow-hidden border transition-all shrink-0 ${
                    displayedImage === src
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105 bg-white"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={resolveImageUrl(src)}
                    alt={`${name} gallery ${i + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {name}
                {brand && (
                  <span className="text-slate-500 font-normal text-base block sm:inline sm:ml-2">
                    ({brand})
                  </span>
                )}
              </h2>

              <div className="text-sm flex items-center gap-1.5 text-slate-500 mt-2 bg-slate-50 px-2 py-1 rounded border border-slate-200/50 w-fit">
                <CiBarcode size={18} className="text-slate-400 shrink-0" />
                <span className="font-mono tracking-wider">
                  {barcodes.length > 0 ? barcodes.map((b) => b.code).join(", ") : "No Barcode"}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-2">
                SKU: <span className="text-slate-700 font-semibold font-mono">{sku}</span> · ID: <span className="text-slate-700 font-semibold font-mono">{displayId}</span>
                {category?.category && ` · ${category.category}`}
                {category?.subcategory && ` / ${category.subcategory}`}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"
                    >
                      <FiTag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                  Pricing Metrics
                </span>
                <div className="text-slate-900 font-extrabold text-lg">
                  {currency}{Number(pricing.sellPrice || 0).toFixed(2)}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  MRP: {currency}{Number(pricing.mrp || 0).toFixed(2)}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Cost: {currency}{Number(pricing.buyPrice || 0).toFixed(2)} · Tax: {pricing.taxRatePercentage || 0}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">
                  Unit Measurements
                </span>
                <div className="text-slate-900 font-semibold text-sm">
                  Base Unit: <span className="font-bold text-slate-800">{uom.baseUnit || "-"}</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1.5">
                  Sales: {uom.salesUnit || "-"}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Purchase: {uom.purchaseUnit || "-"}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Conversion Factor: ×{uom.conversionFactor ?? 1}
                </div>
              </div>
            </div>

            {(compliance.hsnCode || compliance.countryOfOrigin) && (
              <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/60 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    HSN Code
                  </span>
                  <span className="text-slate-800 font-semibold font-mono mt-0.5 block">
                    {compliance.hsnCode || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                    Country of Origin
                  </span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {compliance.countryOfOrigin || "-"}
                  </span>
                </div>
              </div>
            )}

            {Object.values(flags).some(Boolean) && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(flags).map(
                  ([key, value]) =>
                    value && (
                      <span
                        key={key}
                        className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded capitalize shadow-sm"
                      >
                        {key.replace(/^is/, "").replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    ),
                )}
              </div>
            )}

            {suppliers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Suppliers ({suppliers.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {suppliers.map((s) => (
                    <span
                      key={s._id}
                      className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm font-mono"
                    >
                      {s.suppliersName || s._id}
                      {s.code ? ` (${s.code})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {specifications.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technical Specifications
                </h3>
                <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                  {specifications.map((spec, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-xs p-2.5 ${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } ${i !== 0 ? "border-t border-slate-100" : ""}`}
                    >
                      <span className="text-slate-500 font-medium">{spec.key}</span>
                      <span className="text-slate-900 font-semibold text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extraDetails.map((section, i) => (
              <div key={i}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.header}
                </h3>
                <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                  {section.body?.map((row, j) => (
                    <div
                      key={j}
                      className={`flex items-center justify-between text-xs p-2.5 ${
                        j % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } ${j !== 0 ? "border-t border-slate-100" : ""}`}
                    >
                      <span className="text-slate-500 font-medium">{row.label}</span>
                      <span className="text-slate-900 font-semibold text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
            <button onClick={close} className={`${secondaryButton} flex-1 justify-center py-2 text-sm`}>
              Close Window
            </button>
            {canEditProduct && (
              <button
                onClick={() => {
                  close();
                  onEdit?.(productData);
                }}
                className={`${primaryButton} bg-[#1D9E75] hover:bg-[#167d5d] text-white flex-1 justify-center gap-2 py-2 text-sm transition-colors`}
              >
                <FiEdit2 size={14} />
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModel;