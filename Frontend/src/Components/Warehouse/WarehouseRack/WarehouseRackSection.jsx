import WarehouseRack from "./WarehouseRack";

// title: the column value or the group name, depending on current groupBy
// colour: group colour, only set when grouping by group name
const WarehouseRackSection = ({ title, colour, racks, onSelectRack, highlightedRackCode }) => {
  return (
    <div className="flex flex-col gap-2 mb-5">
      <span
        className="text-xs font-bold text-emerald-800 border rounded-xl bg-blue-50 px-4 py-1 w-fit flex items-center gap-1.5"
      >
        {colour && (
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: colour }}
          />
        )}
        {title}
      </span>
      <div className="flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 w-[95%]">
          {racks.map((rack) => (
            <WarehouseRack
              key={rack._id}
              rack={rack}
              onSelect={onSelectRack}
              isHighlighted={rack.rackCode === highlightedRackCode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseRackSection;
