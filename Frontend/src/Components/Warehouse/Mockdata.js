export const MOCK_WAREHOUSES = [
  { id: "WH-001", place: "Dhaka Central Depot" },
  { id: "WH-002", place: "Chittagong Port Storage" },
  { id: "WH-003", place: "Gazipur Industrial Hub" },
  { id: "WH-004", place: "Sylhet Distribution Center" },
];

export const RACK_ROWS = ["A", "B", "C", "D"];
export const RACKS_PER_ROW = 50;

export const generateMockRacks = () => {
  const racks = {};
  RACK_ROWS.forEach((row) => {
    for (let i = 1; i <= RACKS_PER_ROW; i++) {
      const code = `${row}${i}`;
      const itemCount = Math.floor(Math.random() * 40);
      racks[code] = {
        code,
        itemCount,
        capacity: 50,
        products:
          itemCount === 0
            ? []
            : Array.from({ length: Math.min(itemCount, 4) }).map((_, idx) => ({
                id: `${code}-P${idx + 1}`,
                name: `Sample Product ${idx + 1}`,
                qty: Math.floor(Math.random() * 20) + 1,
              })),
      };
    }
  });
  return racks;
};

export const MOCK_RACKS = generateMockRacks();

export const occupancyColor = (itemCount, capacity) => {
  if (!capacity) return { style: { backgroundColor: "rgb(239, 68, 68)" }, className: "border-red-400 text-red-950" };

  // Clamp percentage between 0 and 1 just in case itemCount > capacity
  const pct = Math.min(Math.max(itemCount / capacity, 0), 1);

  let r, g;

  if (pct < 0.5) {
    // 0% to 50%: Fade from Red to Yellow
    // Red stays at 255, Green climbs from 0 to 255
    r = 255;
    g = Math.round((pct / 0.5) * 255);
  } else {
    // 50% to 100%: Fade from Yellow to Green
    // Green stays at 255, Red drops from 255 to 0
    r = Math.round((1 - (pct - 0.5) / 0.5) * 255);
    g = 255;
  }

  const b = 0; // Keep blue at 0 for a clean red-yellow-green transition

  return {
    style: { backgroundColor: `rgb(${r}, ${g}, ${b})` },
    className: "border-slate-400 text-slate-900 border" // Static Tailwind utilities
  };
};