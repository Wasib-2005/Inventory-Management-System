// Groups a warehouse's rackdata by its "column" (row letter, e.g. A/B/C)
// and returns counts, sorted alphabetically. Exported separately so other
// components (stats, tooltips, etc.) can reuse the grouping logic.
export const groupRacksByColumn = (rackdata = []) => {
  const counts = new Map();
  rackdata.forEach((r) => {
    const col = r.column || "?";
    counts.set(col, (counts.get(col) || 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([column, count]) => ({ column, count }));
};

// Renders "A · 2  B · 1  C · 1" style badges for a warehouse's racks.
const RackBreakdown = ({ rackdata = [] }) => {
  const groups = groupRacksByColumn(rackdata);

  if (groups.length === 0) {
    return (
      <span className="text-[16px] text-emerald-700/40 italic">
        No racks yet
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {groups.map(({ column, count }) => (
        <span
          key={column}
          title={`Row ${column} — ${count} rack${count === 1 ? "" : "s"}`}
          className="flex items-center gap-1.5 text-[16px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full pl-1 pr-2.5 py-1"
        >
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[16px] font-black leading-none shrink-0">
            {column}
          </span>
          {count}
        </span>
      ))}
    </div>
  );
};

export default RackBreakdown;