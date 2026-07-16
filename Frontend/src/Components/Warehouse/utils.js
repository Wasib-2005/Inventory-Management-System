// ---------------------------------------------------------------------------
// Helpers that work directly with the real API shape:
//   warehouse.rackdata[] -> rack { rackCode, column, group, shelfData[] }
//   rack.shelfData[]     -> shelf { shelfCode, productData[] }
//   shelf.productData[]  -> { productInfo, group, stock: { inStock, maxStock, warningStock } }
// ---------------------------------------------------------------------------

export const DEFAULT_MAX_PRODUCTS = 6;

// The Rack schema declares `group.groupColor` but the sample API response
// actually returns `group.groupColour` (and Shelve's product group always
// uses `groupColour`). Check both spellings defensively so we don't break
// if/when the backend is made consistent.
export const getGroupColour = (group) =>
  group?.groupColour || group?.groupColor || "#94A3B8";

export const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(148, 163, 184, ${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const computeShelfStats = (shelf) => {
  const products = shelf?.productData || [];
  const itemCount = products.reduce((sum, p) => sum + (p.stock?.inStock || 0), 0);
  const capacity = products.reduce((sum, p) => sum + (p.stock?.maxStock || 0), 0);
  return { itemCount, capacity };
};

export const computeRackStats = (rack) => {
  const shelves = rack?.shelfData || [];
  return shelves.reduce(
    (acc, shelf) => {
      const stats = computeShelfStats(shelf);
      return {
        itemCount: acc.itemCount + stats.itemCount,
        capacity: acc.capacity + stats.capacity,
      };
    },
    { itemCount: 0, capacity: 0 },
  );
};

export const isProductLow = (product) => {
  const inStock = product?.stock?.inStock ?? 0;
  const warning = product?.stock?.warningStock ?? 0;
  return inStock <= warning;
};

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

// groupBy: "column" | "group"
export const groupRacks = (racks, groupBy) => {
  const map = new Map();

  (racks || []).forEach((rack) => {
    const key =
      groupBy === "group"
        ? rack.group?.groupName || "Ungrouped"
        : rack.column || "Unassigned";

    if (!map.has(key)) {
      map.set(key, {
        key,
        colour:
          groupBy === "group" ? getGroupColour(rack.group) : null,
        racks: [],
      });
    }
    map.get(key).racks.push(rack);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.key.localeCompare(b.key, undefined, { numeric: true }),
  );
};
