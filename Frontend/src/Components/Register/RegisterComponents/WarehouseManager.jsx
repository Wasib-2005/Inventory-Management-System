import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiHome, FiGrid, FiExternalLink } from "react-icons/fi";
import { getWarehouses } from "./api";


const WarehouseManager = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    getWarehouses(controller.signal)
      .then((res) => {
        const list = (res.data?.data || []).filter((w) => !w.disabled);
        setWarehouses(list);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(err.response?.data?.message || "Could not load warehouses");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
          Warehouses {!isLoading && `(${warehouses.length})`}
        </h4>
        <button
          type="button"
          onClick={() => navigate("/warehouse")}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
          title="Manage warehouses"
        >
          <FiExternalLink size={12} /> Manage
        </button>
      </div>

      {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[12px] text-emerald-700/40 italic">Loading...</p>
        ) : warehouses.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">No warehouses yet</p>
        ) : (
          warehouses.map((w) => (
            <div key={w._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30">
              <div className="w-8 h-8 rounded-md bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                <FiHome size={14} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-emerald-900 truncate">{w.warehouseName}</p>
                <p className="text-[10px] text-emerald-700/50 truncate">{w.place}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700/60 shrink-0">
                <FiGrid size={11} />
                {w.rackRows?.length || 0} × {w.racksPerRow || 0}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WarehouseManager;