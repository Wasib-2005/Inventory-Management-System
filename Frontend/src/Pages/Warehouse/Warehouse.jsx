import { useState, useMemo, useEffect, useCallback } from "react";

import WarehouseHeader from "../../Components/Warehouse/WarehouseHeader";
import WarehouseProductSearch from "../../Components/Warehouse/WarehouseProductSearch";
import WarehouseRackContainer from "../../Components/Warehouse/WarehouseRack/WarehouseRackContainer";
import WarehouseRackModal from "../../Components/Warehouse/WarehouseRack/WarehouseRackModal";
import WarehouseRackFormModal from "../../Components/Warehouse/WarehouseRack/WarehouseRackFormModal";
import WarehouseSelectorModal from "../../Components/Warehouse/WarehouseSelectorModal/WarehouseSelectorModal";
import WarehouseFormModal from "../../Components/Warehouse/WarehouseFormModal";

import axios from "axios";
import sweetalert2 from "sweetalert2";

const API_BASE = `${import.meta.env.VITE_BACKEND_API_HEADER}/api`;

const Warehouse = () => {
  // --- Warehouse list (light, from /warehouses/get) -----------------------
  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // --- Selected warehouse (full, from /warehouses/get/:id) -----------------
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null); // mongo _id
  const [selectedWarehouse, setSelectedWarehouse] = useState(null); // populated detail
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // --- Selector modal -------------------------------------------------------
  const [placeQuery, setPlaceQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [isWarehouseSelectorModalOpen, setIsWarehouseSelectorModalOpen] =
    useState(false);

  // --- Rack grouping + rack detail/add modals -------------------------------
  const [groupBy, setGroupBy] = useState("column"); // "column" | "group"
  const [selectedRackId, setSelectedRackId] = useState(null);
  const [highlightedRackCode, setHighlightedRackCode] = useState(null);
  const [isRackFormOpen, setIsRackFormOpen] = useState(false);

  const [warehouseModal, setWarehouseModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  // rack.rackdata (populated) - always an array
  const racks = selectedWarehouse?.rackdata || [];
  const selectedRack = racks.find((r) => r._id === selectedRackId) || null;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchesPlace = (w.place || "")
        .toLowerCase()
        .includes(placeQuery.toLowerCase());
      const matchesId =
        (w.warehouseId || "").toLowerCase().includes(idQuery.toLowerCase()) ||
        (w.warehouseName || "").toLowerCase().includes(idQuery.toLowerCase());
      return matchesPlace && matchesId;
    });
  }, [warehouses, placeQuery, idQuery]);

  // --- Fetch the full nested warehouse (racks/shelves/products) ------------
  const loadWarehouseDetail = useCallback(async (mongoId) => {
    if (!mongoId) return;
    setIsLoadingDetail(true);
    setDetailError(null);

    try {
      const response = await axios.get(
        `${API_BASE}/warehouses/get/${mongoId}`,
        { withCredentials: true },
      );
      setSelectedWarehouse(response.data.data);
    } catch (err) {
      console.error("Failed to fetch warehouse detail:", err);
      setDetailError("Couldn't load this warehouse. Please try again.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouseId(warehouse._id);
    localStorage.setItem("selectedWarehouseId", warehouse._id);
    setSelectedRackId(null);
    setHighlightedRackCode(null);
    setIsWarehouseSelectorModalOpen(false);
    setPlaceQuery("");
    setIdQuery("");
    loadWarehouseDetail(warehouse._id);
  };

  // --- Warehouse create/edit/delete ----------------------------------------
  const handleOpenCreateWarehouseModal = () => {
    setWarehouseModal({ isOpen: true, mode: "create", initialData: null });
    setIsWarehouseSelectorModalOpen(false);
  };

  const handleEditWarehouse = (warehouse) => {
    setWarehouseModal({ isOpen: true, mode: "edit", initialData: warehouse });
    setIsWarehouseSelectorModalOpen(false);
  };

  const handleCloseWarehouseModal = () => {
    setWarehouseModal({ isOpen: false, mode: "create", initialData: null });
  };

  const handleWarehouseFormSubmit = async (formData) => {
    try {
      if (warehouseModal.mode === "create") {
        const response = await axios.post(
          `${API_BASE}/warehouses/create`,
          formData,
          { withCredentials: true },
        );

        if (response.status !== 201 && response.status !== 200) {
          return { error: "Failed to create warehouse. Please try again." };
        }

        const created = response.data.data;
        setWarehouses((prev) => [...prev, created]);
        handleSelectWarehouse(created);
        handleCloseWarehouseModal();
        return {};
      }

      const target = warehouseModal.initialData;
      const response = await axios.put(
        `${API_BASE}/warehouses/update/${target._id}`,
        formData,
        { withCredentials: true },
      );

      if (response.status !== 200) {
        return { error: "Failed to update warehouse. Please try again." };
      }

      const updated = response.data.data;
      setWarehouses((prev) =>
        prev.map((w) => (w._id === target._id ? updated : w)),
      );

      if (selectedWarehouseId === target._id) {
        loadWarehouseDetail(target._id);
      }

      return {};
    } catch (error) {
      console.error("Error handling warehouse form submission:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const handleDeleteWarehouse = async (mongoId) => {
    try {
      const confirmDelete = await sweetalert2.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the warehouse and its data.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
      });

      if (!confirmDelete.isConfirmed) return;

      const response = await axios.delete(
        `${API_BASE}/warehouses/delete/${mongoId}`,
        { withCredentials: true },
      );

      if (response.status !== 200) {
        return { error: "Failed to delete warehouse. Please try again." };
      }

      setWarehouses((prev) => prev.filter((w) => w._id !== mongoId));

      if (selectedWarehouseId === mongoId) {
        setSelectedWarehouseId(null);
        setSelectedWarehouse(null);
        localStorage.removeItem("selectedWarehouseId");
      }

      handleCloseWarehouseModal();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const handleChangeStatus = () => {
    console.log("Not done");
  };
  const handleRestoreWarehouse = () => {
    console.log("Not done");
  };

  // --- Rack CRUD (endpoints assumed - backend not built yet) ---------------
  const handleAddRack = async (payload) => {
    if (!selectedWarehouseId) return { error: "Select a warehouse first." };

    try {
      await axios.post(
        `${API_BASE}/racks/create`,
        { ...payload, warehouseId: selectedWarehouseId },
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error creating rack:", error);
      return {
        error: error?.response?.data?.message || "Failed to create rack.",
      };
    }
  };

  // --- Shelf CRUD (endpoints assumed - backend not built yet) ---------------
  const handleAddShelf = async (rack, payload) => {
    try {
      await axios.post(
        `${API_BASE}/shelves/create`,
        { ...payload, rackId: rack._id },
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error creating shelf:", error);
      return {
        error: error?.response?.data?.message || "Failed to create shelf.",
      };
    }
  };

  const handleUpdateProductStock = async (shelfId, productId, rawValue) => {
    const inStock = Math.max(0, Number(rawValue) || 0);

    setSelectedWarehouse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rackdata: prev.rackdata.map((rack) => ({
          ...rack,
          shelfData: (rack.shelfData || []).map((shelf) =>
            shelf._id !== shelfId
              ? shelf
              : {
                  ...shelf,
                  productData: shelf.productData.map((p) =>
                    p._id !== productId
                      ? p
                      : { ...p, stock: { ...p.stock, inStock } },
                  ),
                },
          ),
        })),
      };
    });

    try {
      await axios.put(
        `${API_BASE}/shelves/update/${shelfId}`,
        { productId, inStock },
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Error updating stock, re-syncing:", error);
      loadWarehouseDetail(selectedWarehouseId);
    }
  };

  const handleLocateRack = (rackCode) => {
    setSelectedRackId(null);
    setHighlightedRackCode(rackCode);
    requestAnimationFrame(() => {
      document
        .getElementById(`rack-${rackCode}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setTimeout(() => setHighlightedRackCode(null), 2500);
  };

  useEffect(() => {
    const getWarehouseList = async () => {
      setIsLoadingWarehouses(true);
      setLoadError(null);

      try {
        const response = await axios.get(`${API_BASE}/warehouses/get`, {
          withCredentials: true,
        });

        const list = response.data.data || [];
        // .filter(
        //   (w) => !w.disabled && !w.isDeleted,
        // );
        setWarehouses(list);
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
        setLoadError("Couldn't load warehouses. Please try again.");
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    getWarehouseList();
  }, []);

  // --- Restore last-selected warehouse (and fetch its detail) ---------------
  useEffect(() => {
    const storedId = localStorage.getItem("selectedWarehouseId");
    if (storedId) {
      setSelectedWarehouseId(storedId);
      loadWarehouseDetail(storedId);
    }
  }, [loadWarehouseDetail]);

  if (isLoadingWarehouses) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-emerald-700/60">
          Loading warehouses...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-red-600">{loadError}</p>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-emerald-700/60">
          No warehouses yet — create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full min-h-screen p-4 sm:p-6 flex flex-col gap-5">
        <WarehouseHeader
          selectedWarehouse={selectedWarehouse}
          onOpenSwitchModal={() => setIsWarehouseSelectorModalOpen(true)}
          onOpenCreateModal={handleOpenCreateWarehouseModal}
          onOpenEditModal={() =>
            selectedWarehouse && handleEditWarehouse(selectedWarehouse)
          }
        />

        {detailError && (
          <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
            {detailError}
          </div>
        )}

        {selectedWarehouse ? (
          <>
            <WarehouseProductSearch
              racks={racks}
              onLocateRack={handleLocateRack}
            />

            <WarehouseRackContainer
              racks={racks}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              onSelectRack={(rack) => setSelectedRackId(rack._id)}
              highlightedRackCode={highlightedRackCode}
              onAddRack={() => setIsRackFormOpen(true)}
            />
          </>
        ) : (
          <p className="text-xs text-emerald-700/40 font-semibold py-10 text-center">
            {isLoadingDetail
              ? "Loading warehouse..."
              : "Select a warehouse to view its racks."}
          </p>
        )}

        <WarehouseRackModal
          rack={selectedRack}
          isOpen={!!selectedRack}
          onClose={() => setSelectedRackId(null)}
          onUpdateProductStock={handleUpdateProductStock}
          onAddShelf={handleAddShelf}
        />

        <WarehouseRackFormModal
          isOpen={isRackFormOpen}
          onClose={() => setIsRackFormOpen(false)}
          onSubmit={handleAddRack}
        />

        <WarehouseSelectorModal
          isOpen={isWarehouseSelectorModalOpen}
          onClose={() => setIsWarehouseSelectorModalOpen(false)}
          placeQuery={placeQuery}
          setPlaceQuery={setPlaceQuery}
          idQuery={idQuery}
          setIdQuery={setIdQuery}
          filteredWarehouses={filteredWarehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={handleSelectWarehouse}
          onCreateWarehouse={handleOpenCreateWarehouseModal}
          onEditWarehouse={handleEditWarehouse}
          onDeleteWarehouse={handleDeleteWarehouse}
          onChangeStatus={handleChangeStatus} // TODO :add change
          onRestoreWarehouse={handleRestoreWarehouse}
        />

        <WarehouseFormModal
          isOpen={warehouseModal.isOpen}
          mode={warehouseModal.mode}
          initialData={warehouseModal.initialData}
          onClose={handleCloseWarehouseModal}
          onSubmit={handleWarehouseFormSubmit}
          onDelete={handleDeleteWarehouse}
        />
      </div>
    </div>
  );
};

export default Warehouse;
