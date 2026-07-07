const ProfileWarehouseSelectorCart = ({ w, selectedWarehouse, onSelectWarehouse }) => {
  const isSelected = selectedWarehouse?.id === w.id;

  return (
    <button
      onClick={() => onSelectWarehouse(w)}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 text-left ${
        isSelected
          ? "bg-emerald-200/60 border-emerald-400/70"
          : "bg-white/40 border-emerald-300/40 hover:bg-white/60"
      }`}
    >
      <p className="flex flex-col">
        <span className="text-l font-bold text-emerald-900">
          {w.warehouseName} · {w.place}
        </span>
        <span className="text-sm">{w.address}</span>
      </p>
      <span className="text-[10px] font-bold text-emerald-700/50 shrink-0">
        {w.id}
      </span>
    </button>
  );
};

export default ProfileWarehouseSelectorCart;