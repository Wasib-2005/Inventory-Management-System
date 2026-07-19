import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

const QTY_LABELS = {
  inbound: "Qty Received",
  outbound: "Qty Dispatched",
  count: "Counted Qty",
};

const MovementItemsList = ({ type, items, onUpdateItem, onRemoveItem }) => {
  const isCount = type === "count";

  if (items.length === 0) {
    return (
      <p className="text-[12px] text-emerald-700/40 italic py-4 text-center border border-dashed border-emerald-300/40 rounded-lg">
        No products added yet — search above and click a result to add it
      </p>
    );
  }

  const bump = (item, delta) => {
    const next = Math.max(0, (Number(item.qty) || 0) + delta);
    onUpdateItem(item.cartId, { qty: next });
  };

  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
      {items.map((item) => {
        const stock = Number(item.stock) || 0;
        const qty = Number(item.qty) || 0;
        const outOfStock = stock === 0;
        const overDispatch = type === "outbound" && qty > stock;

        return (
          <div
            key={item.cartId}
            className={`p-2.5 rounded-lg border ${
              outOfStock
                ? "bg-rose-50/60 border-rose-300/60"
                : "bg-emerald-50/40 border-emerald-300/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
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

            <div className={`grid gap-2 items-end ${isCount ? "grid-cols-1" : "grid-cols-3"}`}>
              {/* Qty - meaning changes per movement type */}
              <div>
                <label className="block text-[9px] font-bold text-blue-700/60 uppercase mb-0.5">
                  {QTY_LABELS[type]}
                </label>
                <div className="flex items-center border border-blue-300/60 rounded overflow-hidden bg-blue-50/40 w-fit">
                  <button
                    type="button"
                    onClick={() => bump(item, -1)}
                    disabled={qty <= 0}
                    className="w-6 h-7 flex items-center justify-center text-blue-700 hover:bg-blue-100 disabled:opacity-30"
                  >
                    <FiMinus size={11} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={item.qty}
                    onChange={(e) =>
                      onUpdateItem(item.cartId, {
                        qty: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-10 text-xs text-center font-bold text-blue-900 py-1 border-x border-blue-300/60 bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => bump(item, 1)}
                    className="w-6 h-7 flex items-center justify-center text-blue-700 hover:bg-blue-100"
                  >
                    <FiPlus size={11} />
                  </button>
                </div>
              </div>

              {!isCount && (
                <>
                  <div>
                    <label className="block text-[9px] font-bold text-emerald-700/50 uppercase mb-0.5">
                      Current Stock
                    </label>
                    <p
                      className={`text-xs font-bold py-1 ${
                        outOfStock ? "text-rose-600" : "text-emerald-900"
                      }`}
                    >
                      {stock}
                    </p>
                  </div>

                  <div className="text-right">
                    <label className="block text-[9px] font-bold text-emerald-700/60 uppercase mb-0.5">
                      Resulting Stock
                    </label>
                    <p className="text-xs font-black text-emerald-700 py-1">
                      {type === "inbound" ? stock + qty : stock - qty}
                    </p>
                  </div>
                </>
              )}
            </div>

            {overDispatch && (
              <p className="mt-1.5 text-[10px] font-bold text-rose-600">
                ⚠ Dispatch quantity exceeds current stock ({stock})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MovementItemsList;