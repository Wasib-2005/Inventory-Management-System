import { FiPackage, FiEdit2, FiTrash2, FiTag } from "react-icons/fi";
import { CiBarcode } from "react-icons/ci";
import {
  resolveImageUrl,
  normalizeCategoryData,
} from "../ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/productAdapters";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200",
  ARCHIVED: "bg-amber-50 text-amber-600 border-amber-200",
  DISCONTINUED: "bg-rose-50 text-rose-600 border-rose-200",
};

const VISIBLE_TAGS = 3;

const ProductsList = ({ productData, canEditProduct, onClick, onEdit, onDelete }) => {
  const {
    displayId,
    parentProductId,
    barcodes = [],
    name,
    sku,
    brand,
    status,
    categoryData,
    tags = [],
    uom = {},
    pricing = {},
    image,
  } = productData;

  const headerImage = image?.header;
  const primaryBarcode = barcodes[0]?.code;
  const category = normalizeCategoryData(categoryData);
  const visibleTags = tags.slice(0, VISIBLE_TAGS);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-slate-50/60 shadow-sm hover:shadow-md rounded-xl border border-slate-200 p-4 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center gap-4"
    >
      {/* PHOTO */}
      <div className="relative h-50 w-full md:w-30 md:h-30 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform">
        {headerImage ? (
          <img
            src={resolveImageUrl(headerImage)}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FiPackage size={22} className="text-slate-400" />
        )}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
            {displayId}
          </span>
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
              !parentProductId
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-purple-50 text-purple-600 border-purple-200"
            }`}
          >
            {!parentProductId ? "Base" : "Variant"}
          </span>
          {status && (
            <span
              className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                STATUS_STYLES[status] || STATUS_STYLES.DRAFT
              }`}
            >
              {status}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {name}
          {brand && <span className="text-slate-400 font-normal"> · {brand}</span>}
        </h3>

        <p className="text-[12px] truncate flex items-center gap-1">
          <CiBarcode size={14} className="text-slate-400 shrink-0" />
          <span className={`${!primaryBarcode && "text-red-600"}`}>
            {primaryBarcode || "No barcode"}
          </span>
        </p>

        <p className="text-xs text-slate-400 truncate">
          {sku}
          {category?.category && (
            <>
              {" "}
              · <span className="text-slate-500 font-medium">{category.category}</span>
              {category.subcategory && ` / ${category.subcategory}`}
            </>
          )}
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-0.5">
          {visibleTags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full"
                >
                  <FiTag size={9} />
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="text-[10px] text-slate-400">+{extraTagCount}</span>
              )}
            </div>
          )}

          {/* Price */}
          <span className="text-xs ml-auto md:ml-0">
            <span className="text-slate-400">MRP </span>
            <span className="font-medium text-slate-600">
              {import.meta.env.VITE_CURRENCY_SYMBOL}
              {Number(pricing.mrp || 0).toFixed(2)}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-400">Sell </span>
            <span className="font-bold text-slate-900">
              {import.meta.env.VITE_CURRENCY_SYMBOL}
              {Number(pricing.sellPrice || 0).toFixed(2)}
            </span>
            {uom.baseUnit && (
              <span className="text-slate-400"> / {uom.baseUnit}</span>
            )}
          </span>
        </div>
      </div>

      {/* BUTTONS */}
      {canEditProduct && (
        <div className="flex md:flex-col items-center justify-end md:justify-center gap-1 flex-shrink-0 self-end md:self-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
            title="Edit product"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors"
            title="Delete product"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
