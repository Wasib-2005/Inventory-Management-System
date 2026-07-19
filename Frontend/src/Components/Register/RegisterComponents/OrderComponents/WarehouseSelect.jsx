import { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";
import { getWarehouses } from "./api";

const WarehouseSelect = ({ value, onChange, excludeId, label = "Warehouse" }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getWarehouses(controller.signal)
      .then((res) => {
        const list = (res.data?.data || []).filter((w) => !w.disabled);
        setWarehouses(list);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError("Could not load warehouses");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const options = excludeId ? warehouses.filter((w) => w._id !== excludeId) : warehouses;

  return (
    <div>
      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <FiHome
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40"
        />
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50 appearance-none"
        >
          <option value="">{isLoading ? "Loading..." : "Select a warehouse"}</option>
          {options.map((w) => (
            <option key={w._id} value={w._id}>
              {w.warehouseName} — {w.place}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default WarehouseSelect;