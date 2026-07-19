import { useState, useEffect } from "react";
import { WareHouseContext } from "./WareHouseContext";

const STORAGE_KEY = "selectedWarehouseId";

export const WareHouseContextProvider = ({ children }) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selectedWarehouseId == null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedWarehouseId));
      }
    } catch (err) {
      console.error("Failed to persist warehouse to localStorage:", err);
    }
  }, [selectedWarehouseId]);

  return (
    <WareHouseContext.Provider
      value={{
        wareHouseStorageKey: STORAGE_KEY,
        selectedWarehouseId,
        setSelectedWarehouseId,
      }}
    >
      {children}
    </WareHouseContext.Provider>
  );
};
