import { useContext, useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";
import { getWarehouseById } from "../api";
import { WareHouseContext } from "../../../../Contexts/WareHouseContext/WareHouseContext";

const CurrentWarehouseDisplay = ({
  label = "Current Warehouse",
  warehouse: warehouseProp,
  isLoading: isLoadingProp,
  error: errorProp,
}) => {
  const { selectedWarehouseId } = useContext(WareHouseContext);
  const [localWarehouse, setLocalWarehouse] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState("");

  const usingOwnFetch = warehouseProp === undefined;

  useEffect(() => {
    if (!usingOwnFetch) return;
    if (!selectedWarehouseId) {
      setLocalWarehouse(null);
      setLocalLoading(false);
      return;
    }
    const controller = new AbortController();
    setLocalLoading(true);
    setLocalError("");
    getWarehouseById(selectedWarehouseId, controller.signal)
      .then((res) => setLocalWarehouse(res.data?.data || null))
      .catch((err) => {
        if (err.name !== "CanceledError") setLocalError("Could not load current warehouse");
      })
      .finally(() => setLocalLoading(false));
    return () => controller.abort();
  }, [selectedWarehouseId, usingOwnFetch]);

  const warehouse = usingOwnFetch ? localWarehouse : warehouseProp;
  const isLoading = usingOwnFetch ? localLoading : isLoadingProp;
  const error = usingOwnFetch ? localError : errorProp;

  return (
    <div>
      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-emerald-300/50 bg-emerald-50/60 min-h-[38px]">
        <div className="w-7 h-7 rounded-md bg-white border border-emerald-200 flex items-center justify-center shrink-0">
          <FiHome size={13} className="text-emerald-600" />
        </div>
        <div className="min-w-0">
          {!selectedWarehouseId ? (
            <p className="text-xs font-semibold text-rose-600">No warehouse selected</p>
          ) : isLoading ? (
            <p className="text-xs text-emerald-700/50 italic">Loading...</p>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <>
              <p className="text-xs font-semibold text-emerald-900 truncate">
                {warehouse?.warehouseName}
              </p>
              <p className="text-[10px] text-emerald-700/50 truncate">{warehouse?.place}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentWarehouseDisplay;