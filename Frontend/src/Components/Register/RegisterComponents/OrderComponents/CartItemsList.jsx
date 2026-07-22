import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiMinus, FiPlus, FiAlertTriangle, FiBox, FiLayers, FiZap } from "react-icons/fi";

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

  const handleRackChange = (item, rackId) => {
    const first = (item.shelves || []).find((s) => s.rackData?._id === rackId);
    onUpdateItem(item.cartId, {
      rackId,
      rackCode: first?.rackData?.rackCode || null,
      shelfId: first?.shelfId || null,
      shelfCode: first?.shelfCode || null,
      stock: Number(first?.stock?.inStock) || 0,
      warningStock: Number(first?.stock?.warningStock) || 0,
    });
  };

  const handleShelfChange = (item, shelfId) => {
    const shelf = (item.shelves || []).find((s) => s.shelfId === shelfId);
    onUpdateItem(item.cartId, {
      shelfId,
      shelfCode: shelf?.shelfCode || null,
      stock: Number(shelf?.stock?.inStock) || 0,
      warningStock: Number(shelf?.stock?.warningStock) || 0,
    });
  };

  const handleAutoLowest = (item) => {
    const shelves = item.shelves || [];
    if (!shelves.length) return;
    const lowest = [...shelves].sort(
      (a, b) => (Number(a.stock?.inStock) || 0) - (Number(b.stock?.inStock) || 0),
    )[0];
    onUpdateItem(item.cartId, {
      rackId: lowest.rackData?._id || null,
      rackCode: lowest.rackData?.rackCode || null,
      shelfId: lowest.shelfId,
      shelfCode: lowest.shelfCode,
      stock: Number(lowest.stock?.inStock) || 0,
      warningStock: Number(lowest.stock?.warningStock) || 0,
    });
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
          const isLowStock =
            !outOfStock &&
            Number(item.warningStock) > 0 &&
            Number(item.stock) <= Number(item.warningStock);
          const overOrdered = !outOfStock && Number(item.qty) > Number(item.stock);

          const shelves = item.shelves || [];
          const racks = [
            ...new Map(shelves.map((s) => [s.rackData?._id, s.rackData?.rackCode])).entries(),
          ];
          const shelvesInRack = shelves.filter((s) => s.rackData?._id === item.rackId);

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
                    {isLowStock && (
                      <p className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                        <FiAlertTriangle size={10} />{" "}
                        {item.rackId ? "Low stock on this shelf" : "Low stock overall"}
                      </p>
                    )}
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

              {/* Where — pick which shelf this line is pulled from */}
              {shelves.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[9px] font-bold text-emerald-700/50 uppercase">
                      Where
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAutoLowest(item)}
                      className="flex items-center gap-1 text-[9px] font-bold text-purple-600 hover:text-purple-700"
                    >
                      <FiZap size={9} /> Lowest stock
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <FiBox
                        size={11}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-700/40"
                      />
                      <select
                        value={item.rackId || ""}
                        onChange={(e) => handleRackChange(item, e.target.value)}
                        className="w-full text-[11px] font-semibold pl-6 pr-2 py-1.5 rounded-lg border border-emerald-300/50 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none"
                      >
                        {racks.map(([id, code]) => (
                          <option key={id} value={id}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <FiLayers
                        size={11}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-700/40"
                      />
                      <select
                        value={item.shelfId || ""}
                        onChange={(e) => handleShelfChange(item, e.target.value)}
                        disabled={!item.rackId}
                        className="w-full text-[11px] font-semibold pl-6 pr-2 py-1.5 rounded-lg border border-emerald-300/50 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none disabled:opacity-50"
                      >
                        {shelvesInRack.map((s) => {
                          const inStock = Number(s.stock?.inStock) || 0;
                          const warningStock = Number(s.stock?.warningStock) || 0;
                          const low = inStock > 0 && warningStock > 0 && inStock <= warningStock;
                          return (
                            <option key={s.shelfId} value={s.shelfId}>
                              {s.shelfCode} — {inStock} in stock{low ? " (low)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

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
                      outOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-emerald-900"
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

              {overOrdered && (
                <p className="mt-1.5 text-[10px] font-bold text-rose-600">
                  ⚠ Quantity exceeds available stock ({item.stock})
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartItemsList;