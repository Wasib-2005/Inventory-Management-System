// ProductsModel.jsx
import {
  FiX,
  FiPackage,
  FiMapPin,
  FiArrowUp,
  FiArrowDown,
  FiEdit2,
} from "react-icons/fi";
import { LuLayers } from "react-icons/lu";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { secondaryButton } from "../../../Theme/secondaryButton";
import { primaryButton } from "../../../Theme/primaryButton";

const stockState = (currentStock, lowStockThreshold) => {
  if (currentStock <= 0)
    return { label: "Out of Stock", className: "bg-red-100 text-red-700 border-red-300/60" };
  if (currentStock <= lowStockThreshold)
    return { label: "Low Stock", className: "bg-amber-100 text-amber-700 border-amber-300/60" };
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-700 border-emerald-300/60" };
};

const ProductsModel = ({ productData, canEditProduct, onClose }) => {
  if (!productData) return null;

  const {
    id,
    name,
    sku,
    category,
    unit,
    currentStock,
    lowStockThreshold,
    unitCost,
    location,
    variants,
    lastMovement,
    updatedBy,
    image,
  } = productData;

  const status = stockState(currentStock, lowStockThreshold);
  const MovementIcon = lastMovement?.type === "IN" ? FiArrowUp : FiArrowDown;
  const movementColor = lastMovement?.type === "IN" ? "text-emerald-600" : "text-rose-600";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${commonComponentBG()} w-full max-w-lg max-h-[85vh] overflow-y-auto`}
      >
        {/* Header image */}
        <div className="relative h-40 bg-emerald-50 rounded-t-2xl overflow-hidden border-b border-emerald-300/40">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage size={36} className="text-emerald-700/40" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-white/80 hover:bg-white text-emerald-800 transition-colors"
          >
            <FiX size={16} />
          </button>

          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-2 py-1 rounded border ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">{name}</h2>
            <p className="text-[11px] text-emerald-700/50 font-semibold uppercase tracking-wide">
              {sku} · {category} · {id}
            </p>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">Current Stock</p>
              <p className="text-emerald-900 font-bold text-base">{currentStock} {unit}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">Unit Cost</p>
              <p className="text-emerald-900 font-bold text-base">${unitCost?.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40 flex flex-col gap-1">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">Location</p>
              <p className="text-emerald-900 font-semibold flex items-center gap-1">
                <FiMapPin size={12} /> {location}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40 flex flex-col gap-1">
              <p className="text-emerald-700/50 font-semibold uppercase text-[10px]">Variants</p>
              <p className="text-emerald-900 font-semibold flex items-center gap-1">
                <LuLayers size={12} /> {variants}
              </p>
            </div>
          </div>

          {/* Last movement */}
          {lastMovement && (
            <div className="p-3 rounded-lg bg-white/50 border border-emerald-300/40 flex items-center justify-between text-[12px]">
              <span className={`flex items-center gap-1.5 font-semibold ${movementColor}`}>
                <MovementIcon size={13} />
                Last: {lastMovement.type} {lastMovement.qty} {unit}
              </span>
              <span className="text-emerald-700/50">{lastMovement.date}</span>
            </div>
          )}

          <p className="text-[11px] text-emerald-700/40">Last updated by {updatedBy}</p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className={secondaryButton}>
              Close
            </button>
            {canEditProduct && (
              <button className={`${primaryButton} bg-[#1D9E75] text-white`}>
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

export default ProductsModel;