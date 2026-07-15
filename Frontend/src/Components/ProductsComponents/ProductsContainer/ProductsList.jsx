import { FiPackage, FiEdit2, FiTrash2, FiTag, FiUser, FiCalendar, FiRotateCcw, FiLayers } from "react-icons/fi";
import { CiBarcode } from "react-icons/ci";
import { normalizeCategoryData } from "../ProductsModels/ProductsCreateEditModel/ProductsCreateEditModelComponents/productAdapters";
import { makeImageUrl } from "../../../Service/auth/makeImageUrl";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  ARCHIVED: "bg-amber-50 text-amber-700 border-amber-200",
  DISCONTINUED: "bg-rose-50 text-rose-700 border-rose-200",
};

const VISIBLE_TAGS = 3;

const ProductsList = ({
  productData,
  canEditProduct,
  onClick,
  onEdit,
  onDelete,
  onRestore, // Added handler for recovery action
}) => {
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
    createdBy,
    updatedBy,
    deleteBy,
    isDeleted,
    createdAt,
    updatedAt,
  } = productData;

  const headerImage = image?.header;
  const primaryBarcode = barcodes[0]?.code;
  const category = normalizeCategoryData(categoryData);
  const visibleTags = tags.slice(0, VISIBLE_TAGS);
  const extraTagCount = tags.length - visibleTags.length;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const currencySymbol = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  return (
    <div
      onClick={onClick}
      className={`group bg-white hover:bg-slate-50 shadow-sm hover:shadow transition-all duration-200 rounded-xl border p-4 cursor-pointer flex flex-col md:flex-row md:items-center gap-5 ${
        isDeleted 
          ? "border-rose-300 border-l-4 border-l-rose-500 bg-rose-50/10 opacity-80" 
          : "border-slate-200 border-l-transparent"
      }`}
    >
      {/* PHOTO CONTAINER */}
      <div className="relative w-full h-48 md:w-24 md:h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
        {headerImage ? (
          <img
            src={makeImageUrl(headerImage)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <FiPackage size={26} className="text-slate-400" />
        )}
      </div>

      {/* CORE DETAILS CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
            {displayId}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              !parentProductId
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {!parentProductId ? "Base" : "Variant"}
          </span>
          {status && !isDeleted && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                STATUS_STYLES[status] || STATUS_STYLES.DRAFT
              }`}
            >
              {status}
            </span>
          )}
          {isDeleted && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-rose-600 text-white border-rose-700 animate-pulse">
              Archived / Deleted
            </span>
          )}
        </div>

        {/* Heading Info */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {name}
            {brand && <span className="text-slate-500 font-normal text-sm"> ({brand})</span>}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] flex items-center gap-1">
              <FiLayers className="text-slate-400" size={12} />
              {sku}
            </span>
            {category?.category && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="truncate bg-slate-50/60 px-2 py-0.5 rounded border border-slate-100 text-slate-600">
                  {category.category}
                  {category.subcategory && ` / ${category.subcategory}`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Barcode & Extra Tags */}
        <div className="flex flex-wrap items-center gap-3 mt-0.5">
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
            <CiBarcode size={16} className="text-slate-500 shrink-0" />
            <span className={!primaryBarcode ? "text-rose-600 font-medium italic" : "font-mono"}>
              {primaryBarcode || "No barcode"}
            </span>
          </div>

          {visibleTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full"
                >
                  <FiTag size={10} className="text-slate-400" />
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="text-[11px] font-medium text-slate-400">
                  +{extraTagCount} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* METADATA TRACKING FOOTER */}
        <div className="mt-1 pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
          {createdBy && (
            <div className="flex items-center gap-1">
              <FiUser className="text-slate-400" size={12} />
              <span className="text-slate-400">Created by:</span>
              <span className="font-medium text-slate-700" title={createdBy.email}>
                {createdBy.username}
              </span>
              {createdAt && (
                <span className="text-slate-400 font-light flex items-center gap-0.5">
                  <FiCalendar size={11} className="ml-1" />
                  {formatDate(createdAt)}
                </span>
              )}
            </div>
          )}

          {updatedBy && !isDeleted && (
            <div className="flex items-center gap-1">
              <FiUser className="text-slate-400" size={12} />
              <span className="text-slate-400">Updated by:</span>
              <span className="font-medium text-slate-700" title={updatedBy.email}>
                {updatedBy.username}
              </span>
              {updatedAt && (
                <span className="text-slate-400 font-light flex items-center gap-0.5">
                  <FiCalendar size={11} className="ml-1" />
                  {formatDate(updatedAt)}
                </span>
              )}
            </div>
          )}

          {isDeleted && deleteBy && (
            <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              <FiUser className="text-rose-500" size={12} />
              <span className="font-medium">Deleted by:</span>
              <span className="font-bold" title={deleteBy.email}>
                {deleteBy.username}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PRICING & ACTION CONTROLS */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 shrink-0 pt-3 md:pt-0 border-t border-slate-100 md:border-none self-stretch md:self-auto min-w-[140px]">
        {/* Price Column */}
        <div className="flex flex-col items-start md:items-end gap-0.5 justify-center">
          <div className="text-[11px] text-slate-400 tracking-wide font-medium">
            MRP: <span className="line-through">{currencySymbol}{Number(pricing.mrp || 0).toFixed(2)}</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {currencySymbol}{Number(pricing.sellPrice || 0).toFixed(2)}
            {uom.baseUnit && (
              <span className="text-xs text-slate-400 font-normal"> / {uom.baseUnit}</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        {canEditProduct && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-100"
              title="Edit product"
            >
              <FiEdit2 size={16} />
            </button>
            
            {isDeleted ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(); // Explicit dynamic recovery handler invocation
                }}
                className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-lg transition-colors border border-emerald-200 flex items-center gap-1 text-xs font-semibold"
                title="Recover product"
              >
                <FiRotateCcw size={15} />
                <span>Recover</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                title="Delete product"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;