export const RACK_ROWS = ["A", "B", "C", "D"];
export const RACKS_PER_ROW = 50;
export const SHELVES_PER_RACK = 4;
export const DEFAULT_MAX_PRODUCTS = 6;

const buildShelf = (rackCode, shelfIndex) => {
  const maxProducts = Math.floor(Math.random() * 4) + 3; // 3-6 product slots
  const productCount = Math.floor(Math.random() * (maxProducts + 1));

  const products = Array.from({ length: productCount }).map((_, idx) => {
    const maxQty = Math.floor(Math.random() * 20) + 5;
    const qty = Math.floor(Math.random() * (maxQty + 1));
    return {
      id: `${rackCode}-S${shelfIndex + 1}-P${idx + 1}`,
      name: `Sample Product ${idx + 1}`,
      qty,
      maxQty,
    };
  });

  const itemCount = products.reduce((sum, p) => sum + p.qty, 0);
  const capacity = products.reduce((sum, p) => sum + p.maxQty, 0);

  return {
    id: `${rackCode}-S${shelfIndex + 1}`,
    name: `Shelf ${shelfIndex + 1}`,
    capacity,
    itemCount,
    maxProducts,
    products,
  };
};

// Builds a single rack (with mock shelves/products) for a given code, e.g. "E12".
export const generateRack = (code) => {
  const shelves = Array.from({ length: SHELVES_PER_RACK }).map((_, idx) =>
    buildShelf(code, idx)
  );

  const itemCount = shelves.reduce((sum, s) => sum + s.itemCount, 0);
  const capacity = shelves.reduce((sum, s) => sum + s.capacity, 0);

  return { code, capacity, itemCount, shelves };
};

// Accepts a specific rackRows / racksPerRow so each warehouse can have its
// own layout (falls back to the global defaults if not provided).
export const generateMockRacks = (rackRows = RACK_ROWS, racksPerRow = RACKS_PER_ROW) => {
  const racks = {};

  rackRows.forEach((row) => {
    for (let i = 1; i <= racksPerRow; i++) {
      const code = `${row}${i}`;
      racks[code] = generateRack(code);
    }
  });

  return racks;
};

export const MOCK_RACKS = generateMockRacks();

// Determines which existing racks would be dropped by a resize (row removal
// or racksPerRow shrink) and still contain products - these resizes must be
// blocked so stock isn't silently lost.
export const findRemovedRacksWithProducts = (
  oldRows,
  oldRacksPerRow,
  newRows,
  newRacksPerRow,
  racks,
) => {
  const newRowSet = new Set(newRows);
  const blocked = [];

  oldRows.forEach((row) => {
    const rowRemoved = !newRowSet.has(row);

    for (let i = 1; i <= oldRacksPerRow; i++) {
      const columnRemoved = i > newRacksPerRow;
      if (!rowRemoved && !columnRemoved) continue;

      const rack = racks[`${row}${i}`];
      if (rack && rack.itemCount > 0) {
        blocked.push(rack.code);
      }
    }
  });

  return blocked;
};

// Whether a shelf has hit its product-slot limit (independent of stock qty).
export const isShelfFull = (shelf) => shelf.products.length >= shelf.maxProducts;

export const occupancyColor = (itemCount, capacity) => {
  if (!capacity)
    return {
      style: { backgroundColor: "rgb(203, 213, 225)" },
      className: "border-slate-400 text-slate-500",
    };

  const pct = Math.min(Math.max(itemCount / capacity, 0), 1);
  let r, g;
  if (pct < 0.5) {
    r = 255;
    g = Math.round((pct / 0.5) * 255);
  } else {
    r = Math.round((1 - (pct - 0.5) / 0.5) * 255);
    g = 255;
  }
  const b = 0;

  return {
    style: { backgroundColor: `rgb(${r}, ${g}, ${b})` },
    className: "border-slate-400 text-slate-900 border",
  };
};