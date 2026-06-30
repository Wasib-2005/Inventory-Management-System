import WarehouseRack from "./WarehouseRack";

const WarehouseRackRow = ({ row, racks, onSelectRack }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-emerald-800 border rounded-xl bg-blue-50 px-4 py-1">
        Row {row}
      </span>
      <div className="flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 w-[95%]">
          {racks.map((rack) => (
            <WarehouseRack
              key={rack.code}
              rack={rack}
              onSelect={onSelectRack}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseRackRow;
