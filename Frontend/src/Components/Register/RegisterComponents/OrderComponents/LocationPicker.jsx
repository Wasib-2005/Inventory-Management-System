const LocationPicker = ({ warehouse, value, onChange, label }) => {
  const racks = warehouse?.rackdata || [];
  const selectedRack = racks.find((rack) => rack._id === value?.rackId);
  const shelves = selectedRack?.shelfData || [];

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase text-amber-800">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={value?.rackId || ""}
          onChange={(event) => {
            const rack = racks.find((item) => item._id === event.target.value);
            onChange({ rackId: rack?._id || "", rackCode: rack?.rackCode || "", shelfId: "", shelfCode: "" });
          }}
          className="text-xs px-2 py-2 rounded-md border border-amber-200 bg-white"
        >
          <option value="">Select rack</option>
          {racks.map((rack) => <option key={rack._id} value={rack._id}>{rack.rackCode}</option>)}
        </select>
        <select
          value={value?.shelfId || ""}
          disabled={!value?.rackId}
          onChange={(event) => {
            const shelf = shelves.find((item) => item._id === event.target.value);
            onChange({ ...value, shelfId: shelf?._id || "", shelfCode: shelf?.shelfCode || "" });
          }}
          className="text-xs px-2 py-2 rounded-md border border-amber-200 bg-white disabled:opacity-50"
        >
          <option value="">Select shelves</option>
          {shelves.map((shelf) => <option key={shelf._id} value={shelf._id}>{shelf.shelfCode}</option>)}
        </select>
      </div>
    </div>
  );
};

export default LocationPicker;
