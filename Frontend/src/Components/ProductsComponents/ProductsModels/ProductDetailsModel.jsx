import { useState, useEffect } from "react";
import { FiX, FiPackage, FiMapPin, FiEdit2 } from "react-icons/fi";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../Theme/secondaryButton";
import { primaryButton } from "../../../Theme/primaryButton";
import { occupancyColor } from "../../Warehouse/MockData";

const ProductDetailsModel = ({
  isDetailsOpen,
  setIsDetailsOpen,
  productData,
  canEditProduct,
  onEdit,
}) => {
  const [activeImage, setActiveImage] = useState(productData?.image?.header);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImage(productData?.image?.header);
  }, [productData]);

  if (!isDetailsOpen || !productData) return null;

  const {
    displayId,
    barCode,
    variantOf,
    name,
    sku,
    category,
    unit,
    image,
    store = [],
    price = {},
    extraDetails = [],
  } = productData;

  const headerImage = image?.header;
  const extraImages = image?.extra ?? [];
  const gallery = [headerImage, ...extraImages].filter(Boolean);

  const totalStock = store.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalCapacity = store.reduce(
    (sum, item) => sum + (item.maxQty || 0),
    0,
  );
  const stockBadge = occupancyColor(totalStock, totalCapacity);

  const close = () => setIsDetailsOpen(false);

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-lg max-h-[85vh] overflow-y-auto`}
      >
        {/* Header image */}
        <div className="relative h-60 bg-emerald-50 rounded-t-2xl border-b border-emerald-300/40">
          {activeImage ? (
            <img
              src={activeImage}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={36} className="text-emerald-700/40" />
            </div>
          )}

          <button
            onClick={close}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-white/80 hover:bg-white text-emerald-800 transition-colors"
          >
            <FiX size={16} />
          </button>

          <span
            className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
              !variantOf
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-purple-50 text-purple-600 border-purple-200"
            }`}
          >
            {!variantOf ? "Base Product" : "Variant"}
          </span>

          {/* Thumbnail strip (header + extra images) */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(src)}
                  className={`w-10 h-10 rounded-md overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === src
                      ? "border-white ring-2 ring-emerald-400"
                      : "border-white/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={src}
                    alt={`${name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid gap-2">
            <h2 className="text-lg font-bold text-emerald-900">{name}</h2>
            <p className="text-[14px] truncate">
              <span className="font-bold">Barcode: </span>
              <span className="text-slate-500 ">{barCode}</span>
            </p>
            <p className="text-[11px] text-emerald-700/50 font-semibold uppercase tracking-wide">
              {sku} · {category} · {displayId}
            </p>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">
                Total Stock
              </p>
              <span
                style={stockBadge.style}
                className={`inline-block mt-1 text-[13px] font-bold px-2.5 py-1 rounded-full border ${stockBadge.className}`}
              >
                {totalStock} / {totalCapacity} {unit}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">
                Pricing
              </p>
              <p className="text-emerald-900 font-bold text-base">
                {import.meta.env.VITE_CURRENCY_SYMBOL}
                {price.sellingPrice?.toFixed(2)}
                <span className="text-emerald-700/40 font-medium text-[11px] ml-1.5">
                  (cost {import.meta.env.VITE_CURRENCY_SYMBOL}
                  {price.costPrice?.toFixed(2)})
                </span>
              </p>
            </div>
          </div>

          {/* Locations */}
          <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40">
            <p className="text-emerald-700 font-semibold uppercase text-l mb-2">
              Storage Locations ({store.length})
            </p>
            {store.length > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {store.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-[12px] text-emerald-900"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiMapPin
                        size={12}
                        className={
                          loc.qty > 0 ? "text-emerald-500" : "text-emerald-300"
                        }
                      />
                      Rack {loc.rackCode} · Shelf {loc.Shelf}
                    </span>
                    <span className="text-emerald-700/60">
                      {loc.qty} / {loc.maxQty} {unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-emerald-700/40 italic">
                Unassigned
              </p>
            )}
          </div>

          {/* Extra details sections */}
          {extraDetails.map((section, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-white/50 border border-emerald-300/40"
            >
              <p className="text-emerald-700 font-semibold uppercase text-l mb-2">
                {section.header}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {section.body?.map((row, j) => (
                  <div
                    key={j}
                    className="flex items-baseline justify-between text-[12px] gap-2"
                  >
                    <span className="text-emerald-700/50">{row.label}</span>
                    <span className="text-emerald-900 font-medium text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={close} className={secondaryButton}>
              Close
            </button>
            {canEditProduct && (
              <button
                onClick={() => {
                  close();
                  onEdit?.(productData);
                }}
                className={`${primaryButton} bg-[#1D9E75] text-white`}
              >
                <FiEdit2 size={14} />
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModel;
