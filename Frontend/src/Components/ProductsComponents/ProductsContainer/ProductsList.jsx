// ProductsList.jsx
import { FiPackage, FiMapPin, FiArrowUp, FiArrowDown, FiEdit2 } from "react-icons/fi";
import { LuLayers } from "react-icons/lu";
import { secondaryButton } from "../../../Theme/secondaryButton";

const stockState = (currentStock, lowStockThreshold) => {
  if (currentStock <= 0)
    return { label: "Out of Stock", className: "bg-red-100 text-red-700 border-red-300/60" };
  if (currentStock <= lowStockThreshold)
    return { label: "Low Stock", className: "bg-amber-100 text-amber-700 border-amber-300/60" };
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-700 border-emerald-300/60" };
};

const ProductsList = ({ productData, canEditProduct, onClick }) => {
  const {
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
      onClick={onClick}
      className="bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl border border-emerald-300/50 overflow-hidden hover:border-emerald-400/70 hover:shadow-[0_4px_16px_rgba(47,160,132,0.18)] transition-all cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-40 bg-emerald-50 flex items-center justify-center overflow-hidden border-b border-emerald-300/40">
        {image ? (
          <img src={image} alt={name} className="w-[90%] h-[90%] object-cover" loading="lazy" />
        ) : (
          <FiPackage size={26} className="text-emerald-700/40" />
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded border ${status.className}`}
        >
          {status.label}
        </span>

        {canEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // edit flow — wired later
            }}
            className="absolute top-2 left-2 p-1.5 rounded-md bg-white/70 backdrop-blur border border-emerald-300/50 text-emerald-700 hover:bg-white hover:text-emerald-900 transition-colors"
            title="Edit product"
          >
            <FiEdit2 size={12} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-[13px] font-bold text-emerald-900 truncate">{name}</h3>
          <p className="text-[10px] text-emerald-700/50 font-semibold tracking-wide uppercase">
            {sku} · {category}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-emerald-900/70">
            Qty: <span className="font-bold text-emerald-900">{currentStock} {unit}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-700/60">
            <FiMapPin size={11} />
            {location}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-emerald-900/70">
          <span className="flex items-center gap-1">
            <LuLayers size={12} className="text-emerald-700/50" />
            {variants} variant{variants === 1 ? "" : "s"}
          </span>
          <span className="font-semibold">Cost: ${unitCost.toFixed(2)}</span>
        </div>

        {lastMovement && (
          <div className="flex items-center justify-between text-[10px] text-emerald-700/60 pt-1 border-t border-emerald-300/30">
            <span className={`flex items-center gap-1 font-semibold ${movementColor}`}>
              <MovementIcon size={11} />
              {lastMovement.type} {lastMovement.qty} {unit}
            </span>
            <span>{lastMovement.date}</span>
          </div>
        )}

        <p className="text-[10px] text-emerald-700/40">Updated by {updatedBy}</p>

        {canEditProduct && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // adjust stock flow — wired later
            }}
            className={secondaryButton}
          >
            Adjust Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductsList;