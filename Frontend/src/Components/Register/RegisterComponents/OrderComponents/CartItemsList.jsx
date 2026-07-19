import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiMinus, FiPlus, FiAlertTriangle } from "react-icons/fi";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;

const CartItemsList = ({ items, onUpdateItem, onRemoveItem }) => {
  const [flashId, setFlashId] = useState(null);
  const prevQtyRef = useRef({});

  // Flash a row briefly whenever its qty increases (e.g. same product
  // scanned/selected again from the search panel).
  useEffect(() => {
    items.forEach((item) => {
      const prevQty = prevQtyRef.current[item.cartId];
      if (prevQty !== undefined && Number(item.qty) > Number(prevQty)) {
        setFlashId(item.cartId);
        setTimeout(() => setFlashId((id) => (id === item.cartId ? null : id)), 700);
      }
      prevQtyRef.current[item.cartId] = item.qty;
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div>
        <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-1.5">
          Products in Order
        </h4>
        <p className="text-[12px] text-emerald-700/40 italic py-4 text-center border border-dashed border-emerald-300/40 rounded-lg">
          No products added yet — search above and click a result to add it here
        </p>
      </div>
    );
  }

  const bump = (item, delta) => {
    const next = Math.max(1, (Number(item.qty) || 0) + delta);
    onUpdateItem(item.cartId, { qty: next });
  };

  return (
    <div>
      <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-1.5">
        Products in Order ({items.length})
      </h4>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const mrp = Number(item.price) || 0;
          const lineTotal = (Number(item.qty) || 0) * mrp;
          const isFlashing = flashId === item.cartId;
          const outOfStock = Number(item.stock) === 0;

          return (
            <div
              key={item.cartId}
              className={`p-2.5 rounded-lg border transition-colors duration-300 ${
                outOfStock
                  ? "bg-rose-50/60 border-rose-300/60"
                  : isFlashing
                    ? "bg-emerald-100 border-emerald-400"
                    : "bg-emerald-50/40 border-emerald-300/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-9 h-9 rounded-md object-cover border bg-white shrink-0 ${
                      outOfStock ? "border-rose-300/60" : "border-emerald-300/40"
                    }`}
                    onError={(e) => (e.target.style.visibility = "hidden")}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-[12px] font-semibold truncate ${
                        outOfStock ? "text-rose-900" : "text-emerald-900"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-[10px] ${
                        outOfStock ? "text-rose-700/60" : "text-emerald-700/50"
                      }`}
                    >
                      SKU: {item.sku}
                    </p>
                    {outOfStock && (
                      <p className="flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-0.5">
                        <FiAlertTriangle size={10} /> No stock available
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[9px] font-bold text-emerald-700/50 uppercase">MRP</p>
                  <p className="text-xs font-bold text-emerald-900">
                    {currency}
                    {mrp.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.cartId)}
                  className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
                  title="Remove item"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-end">
                <div>
                  <label className="block text-[9px] font-bold text-emerald-700/50 uppercase mb-0.5">
                    Qty
                  </label>
                  <div className="flex items-center border border-emerald-300/50 rounded overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => bump(item, -1)}
                      className="w-6 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 disabled:opacity-30"
                      disabled={Number(item.qty) <= 1}
                    >
                      <FiMinus size={11} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        onUpdateItem(item.cartId, {
                          qty: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-9 text-xs text-center py-1 border-x border-emerald-300/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => bump(item, 1)}
                      className="w-6 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50"
                    >
                      <FiPlus size={11} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-emerald-700/50 uppercase mb-0.5">
                    Stock
                  </label>
                  <p
                    className={`text-xs font-bold py-1 ${
                      outOfStock ? "text-rose-600" : "text-emerald-900"
                    }`}
                  >
                    {item.stock ?? "—"}
                  </p>
                </div>

                <div className="text-right">
                  <label className="block text-[9px] font-bold text-emerald-700/50 uppercase mb-0.5">
                    Total
                  </label>
                  <p className="text-xs font-bold text-emerald-900 py-1">
                    {currency}
                    {lineTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartItemsList;