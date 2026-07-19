import { useContext } from "react";
import { useNavigate } from "react-router"; // or 'react-router-dom' depending on your setup
import { WareHouseContext } from "../Contexts/WareHouseContext/WareHouseContext";

const ProtectedRouteWarehouse = ({ children }) => {
  const { selectedWarehouseId } = useContext(WareHouseContext);
  const navigate = useNavigate();

  console.log("selectedWarehouseId", selectedWarehouseId);
  
  // If no warehouse is selected, show the centered prompt
  if (!selectedWarehouseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Warehouse Selected
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please select a warehouse to access this section.
          </p>
          
          <button
            onClick={() => navigate("/warehouse")}
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Select a Warehouse
          </button>
        </div>
      </div>
    );
  }

  // If a warehouse is selected, render the protected content
  return children;
};

export default ProtectedRouteWarehouse;