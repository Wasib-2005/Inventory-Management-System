// ProductsList.jsx
import { useState } from "react";
import { FiPackage, FiMapPin, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";
import { occupancyColor } from "../../Warehouse/MockData";

const VISIBLE_LOCATIONS = 3;

const ProductsList = ({ productData, canEditProduct, onClick, onEdit, onDelete }) => {
  const [showAllLocations, setShowAllLocations] = useState(false);

  const {
    _id,
    displayId,
    variantOf,
    name,
    sku,
    category,
    unit,
    image,
    store = [],
    price = {},
  } = productData;

  const headerImage = image?.header;

  const totalStock = store.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalCapacity = store.reduce((sum, item) => sum + (item.maxQty || 0), 0);
  const stockBadge = occupancyColor(totalStock, totalCapacity);

  const hasOverflow = store.length > VISIBLE_LOCATIONS;
  const visibleStore = showAllLocations ? store : store.slice(0, VISIBLE_LOCATIONS);

  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-slate-50/60 shadow-sm hover:shadow-md rounded-xl border border-slate-200 p-4 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center gap-4"
    >
      {/* PHOTO */}
      <div className="relative h-50 w-full md:w-30 md:h-30 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform">
        {headerImage ? (
          <img src={headerImage} alt={name} className="w-full h-full object-cover" loading="lazy" />
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
              !variantOf
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-purple-50 text-purple-600 border-purple-200"
            }`}
          >
            {!variantOf ? "Base" : "Variant"}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-slate-400 truncate">
          {sku} · <span className="text-slate-500 font-medium">{category}</span>
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-0.5">
          {/* Locations */}
          <div className="flex items-center gap-2 flex-wrap">
            {store.length > 0 ? (
              <>
                {visibleStore.map((loc, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-slate-600">
                    <FiMapPin size={12} className={loc.qty > 0 ? "text-emerald-500" : "text-slate-300"} />
                    <span className="font-medium">
                      {loc.rackCode}-{loc.Shelf}{" "}
                      <span className="text-slate-400 font-normal">
                        ({loc.qty} {unit})
                      </span>
                    </span>
                  </div>
                ))}
                {hasOverflow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllLocations((prev) => !prev);
                    }}
                    className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {showAllLocations ? "Show less" : `+${store.length - VISIBLE_LOCATIONS} more`}
                    <FiChevronDown
                      size={12}
                      className={`transition-transform ${showAllLocations ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">Unassigned</span>
            )}
          </div>

          {/* Stock badge */}
          <span
            style={stockBadge.style}
            className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-inner inline-block ${stockBadge.className}`}
          >
            {totalStock} / {totalCapacity} {unit}
          </span>

          {/* Price */}
          <span className="text-xs">
            <span className="text-slate-400">Cost </span>
            <span className="font-medium text-slate-600">${price.costPrice?.toFixed(2)}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-400">Sell </span>
            <span className="font-bold text-slate-900">${price.sellingPrice?.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* BUTTONS */}
      {canEditProduct && (
        <div className="flex md:flex-col items-center justify-end md:justify-center gap-1 flex-shrink-0 self-end md:self-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(_id);
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
            title="Edit product"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(_id);
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