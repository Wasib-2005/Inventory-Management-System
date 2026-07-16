import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FiHome, FiGrid } from "react-icons/fi";

const StockFolder = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses/get`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const list = (res.data?.data || []).filter((w) => !w.disabled);
        setWarehouses(list);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(
            err.response?.data?.message || "Could not load warehouses",
          );
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-emerald-900">
          Stock & Warehouses {!isLoading && `(${warehouses.length})`}
        </h3>
        <p className="text-xs text-emerald-700/50 mt-0.5">
          Where your inventory physically lives
        </p>
      </div>

      {error && <p className="text-[11px] text-red-500">{error}</p>}

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-[12px] text-emerald-700/40 italic">Loading...</p>
        ) : warehouses.length === 0 ? (
          <p className="text-[12px] text-emerald-700/40 italic">
            No warehouses yet
          </p>
        ) : (
          warehouses.map((w) => (
            <div
              key={w._id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
            >
              <div className="w-8 h-8 rounded-md bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                <FiHome size={14} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-emerald-900 truncate">
                  {w.warehouseName}
                </p>
                <p className="text-[10px] text-emerald-700/50 truncate">
                  {w.place}
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700/60 shrink-0">
                <FiGrid size={11} />
                {w.rackRows?.length || 0} × {w.racksPerRow || 0}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-emerald-300/30 pt-4">
        <button
          type="button"
          onClick={() => navigate("/warehouse")}
          className="py-3 flex flex-col items-center justify-center gap-2 rounded-lg border bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-emerald-900 transition-colors group"
        >
          <FiHome className="text-2xl group-hover:scale-105 transition-transform" />
          <span className="font-semibold text-xs">Manage Warehouses</span>
        </button>

        {/* No task/order schema yet - visual placeholder until that exists */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="py-3 flex flex-col items-center justify-center gap-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
        >
          <FiGrid className="text-2xl" />
          <span className="font-semibold text-xs">New Warehouse Task</span>
        </button>
      </div>
    </div>
  );
};

export default StockFolder;
