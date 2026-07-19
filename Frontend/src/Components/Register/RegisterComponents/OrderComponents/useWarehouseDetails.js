import { useContext, useEffect, useState } from "react";
import { getWarehouseById } from "./api";
import { WareHouseContext } from "../../../../Contexts/WareHouseContext/WareHouseContext";

export const useWarehouseDetails = () => {
  const { selectedWarehouseId } = useContext(WareHouseContext);
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedWarehouseId) {
      setWarehouse(null);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    getWarehouseById(selectedWarehouseId, controller.signal)
      .then((res) => setWarehouse(res.data?.data || null))
      .catch((err) => {
        if (err.name !== "CanceledError")
          setError("Could not load current warehouse");
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [selectedWarehouseId]);

  return { selectedWarehouseId, warehouse, isLoading, error };
};
