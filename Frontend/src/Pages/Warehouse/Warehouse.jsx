import { useState, useMemo, useEffect, useCallback, useRef } from "react";

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
  const stockTimers = useRef({});
  const selectedWarehouseRef = useRef(null);

  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [placeQuery, setPlaceQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [isWarehouseSelectorModalOpen, setIsWarehouseSelectorModalOpen] =
    useState(false);

  const [groupBy, setGroupBy] = useState("column");
  const [selectedRackId, setSelectedRackId] = useState(null);
  const [highlightedRackCode, setHighlightedRackCode] = useState(null);

  const [rackModal, setRackModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const [warehouseModal, setWarehouseModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const racks = selectedWarehouse?.rackdata || [];
  const selectedRack = racks.find((r) => r._id === selectedRackId) || null;

  // Keep a ref in sync so debounced callbacks can read the latest
  // selectedWarehouse without depending on a stale closure.
  useEffect(() => {
    selectedWarehouseRef.current = selectedWarehouse;
  }, [selectedWarehouse]);

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

      setWarehouses((prev) =>
        prev.map((w) => (w._id === mongoId ? response?.data?.data : w)),
      );

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

  const handleChangeStatus = async (mongoId, newStatus) => {
    try {
      const confirmChange = await sweetalert2.fire({
        title: "Change status?",
        text: `Are you sure you want to change the status to ${newStatus}?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, change it!",
        confirmButtonColor: "#3085d6",
        cancelButtonText: "Cancel",
      });

      if (!confirmChange.isConfirmed) return;

      const response = await axios.patch(
        `${API_BASE}/warehouses/status/${mongoId}`,
        { status: newStatus },
        { withCredentials: true },
      );

      if (response.status !== 200) {
        return { error: "Failed to change status. Please try again." };
      }

      setWarehouses((prev) =>
        prev.map((w) => (w._id === mongoId ? response?.data?.data : w)),
      );

      if (selectedWarehouseId === mongoId) {
        setSelectedWarehouse(response?.data?.data);
      }

      handleCloseWarehouseModal();
    } catch (error) {
      console.error("Error changing status:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const handleRestoreWarehouse = async (id) => {
    try {
      const warehouseData = await axios.patch(
        `${API_BASE}/warehouses/restore/${id}`,
        {},
        { withCredentials: true },
      );

      setWarehouses((prev) =>
        prev.map((p) => (p._id === id ? warehouseData?.data.data : p)),
      );
    } catch (error) {
      console.error("Error restoring warehouse:", error);
    }
  };

  // --- Rack CRUD -------------------------------------------------------------
  const openCreateRack = () =>
    setRackModal({ isOpen: true, mode: "create", initialData: null });
  const openEditRack = (rack) =>
    setRackModal({ isOpen: true, mode: "edit", initialData: rack });
  const closeRackModal = () =>
    setRackModal({ isOpen: false, mode: "create", initialData: null });

  const handleRackFormSubmit = async (payload) => {
    if (!selectedWarehouseId) return { error: "Select a warehouse first." };

    try {
      if (rackModal.mode === "create") {
        await axios.post(
          `${API_BASE}/racks/create`,
          { ...payload, warehouseId: selectedWarehouseId },
          { withCredentials: true },
        );
      } else {
        await axios.put(
          `${API_BASE}/racks/update/${rackModal.initialData._id}`,
          payload,
          { withCredentials: true },
        );
      }
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error saving rack:", error);
      return {
        error: error?.response?.data?.message || "Failed to save rack.",
      };
    }
  };

  const handleDeleteRack = async (rackId) => {
    const confirmDelete = await sweetalert2.fire({
      title: "Delete this rack?",
      text: "This will remove the rack and its shelves.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    });
    if (!confirmDelete.isConfirmed) return {};

    try {
      await axios.delete(`${API_BASE}/racks/delete/${rackId}`, {
        withCredentials: true,
      });
      await loadWarehouseDetail(selectedWarehouseId);
      setSelectedRackId(null);
      return {};
    } catch (error) {
      console.error("Error deleting rack:", error);
      return {
        error: error?.response?.data?.message || "Failed to delete rack.",
      };
    }
  };

  const handleToggleRackStatus = async (rack) => {
    try {
      await axios.patch(
        `${API_BASE}/racks/status/${rack._id}`,
        { disabled: !rack.disabled },
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error updating rack status:", error);
      return {
        error:
          error?.response?.data?.message || "Failed to update rack status.",
      };
    }
  };

  const handleRestoreRack = async (rackId) => {
    try {
      await axios.patch(
        `${API_BASE}/racks/restore/${rackId}`,
        {},
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error restoring rack:", error);
      return {
        error: error?.response?.data?.message || "Failed to restore rack.",
      };
    }
  };

  // --- Shelf CRUD --------------------------------------------------------------
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

  const handleEditShelf = async (shelfId, payload) => {
    try {
      await axios.put(`${API_BASE}/shelves/update/${shelfId}`, payload, {
        withCredentials: true,
      });
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error updating shelf:", error);
      return {
        error: error?.response?.data?.message || "Failed to update shelf.",
      };
    }
  };

  const handleDeleteShelf = async (shelfId) => {
    const confirmDelete = await sweetalert2.fire({
      title: "Delete this shelf?",
      text: "This will remove the shelf and its products.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    });
    if (!confirmDelete.isConfirmed) return {};

    try {
      await axios.delete(`${API_BASE}/shelves/delete/${shelfId}`, {
        withCredentials: true,
      });
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error deleting shelf:", error);
      return {
        error: error?.response?.data?.message || "Failed to delete shelf.",
      };
    }
  };

  const handleToggleShelfStatus = async (shelf) => {
    try {
      await axios.patch(
        `${API_BASE}/shelves/status/${shelf._id}`,
        { disabled: !shelf.disabled },
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error updating shelf status:", error);
      return {
        error:
          error?.response?.data?.message || "Failed to update shelf status.",
      };
    }
  };

  const handleRestoreShelf = async (shelfId) => {
    try {
      await axios.patch(
        `${API_BASE}/shelves/restore/${shelfId}`,
        {},
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error restoring shelf:", error);
      return {
        error: error?.response?.data?.message || "Failed to restore shelf.",
      };
    }
  };

  // --- Product search + add-to-shelf --------------------------------------
  const handleSearchProducts = useCallback(async (query) => {
    if (!query?.trim()) return [];
    try {
      const response = await axios.get(`${API_BASE}/product/get`, {
        params: { search: query, limit: 8 },
        withCredentials: true,
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }, []);

  const handleAddProductToShelf = async (shelf, payload) => {
    try {
      await axios.post(
        `${API_BASE}/shelves/add-product`,
        { shelfId: shelf._id, ...payload },
        { withCredentials: true },
      );
      await loadWarehouseDetail(selectedWarehouseId);
      return {};
    } catch (error) {
      console.error("Error adding product to shelf:", error);
      return {
        error: error?.response?.data?.message || "Failed to add product.",
      };
    }
  };

  const handleRemoveProductFromShelf = async (shelfId, productId) => {
    const confirmDelete = await sweetalert2.fire({
      title: "Remove this product from the shelf?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    });
    if (!confirmDelete.isConfirmed) return;

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
                  productData: shelf.productData.filter(
                    (p) => p.productInfo?._id !== productId,
                  ),
                },
          ),
        })),
      };
    });

    try {
      await axios.delete(
        `${API_BASE}/shelves/delete-product?shelvesId=${shelfId}&productId=${productId}`,
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Error removing product from shelf, re-syncing:", error);
      loadWarehouseDetail(selectedWarehouseId);
    }
  };

  // field: "inStock" | "maxStock" | "warningStock"
  // productId here is the PRODUCT's own _id (p.productInfo._id from the
  // caller), not the shelf sub-document's own _id.
const handleUpdateProductStock = async (
    shelfId,
    productId,
    field,
    rawValue,
  ) => {
    // 1. STAGE 1: Input text validation
    // If the raw text contains anything other than clean digits, freeze state completely
    const cleanString = String(rawValue).trim();
    const isValidNumericInput = /^\d*$/.test(cleanString); 
    if (!isValidNumericInput) return; 

    const value = Math.max(0, Number(cleanString) || 0);

    // 2. STAGE 2: Optimistic Local UI State Change
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
                    p.productInfo?._id !== productId
                      ? p
                      : { ...p, stock: { ...p.stock, [field]: value } },
                  ),
                },
          ),
        })),
      };
    });

    const key = `${shelfId}-${productId}-${field}`;
    clearTimeout(stockTimers.current[key]);
    stockTimers.current[key] = setTimeout(async () => {
      delete stockTimers.current[key];

      // Read the latest confirmed state via the ref
      const rack = selectedWarehouseRef.current?.rackdata?.find((r) =>
        r.shelfData?.some((s) => s._id === shelfId),
      );
      const shelf = rack?.shelfData?.find((s) => s._id === shelfId);
      const product = shelf?.productData?.find(
        (p) => p.productInfo?._id === productId,
      );

      if (!product) {
        console.warn(
          `Product ${productId} not found on shelf ${shelfId} — cannot sync stock.`,
        );
        return;
      }

      const inStockValue = product.stock.inStock ?? 0;
      const maxStockValue = product.stock.maxStock ?? 0;
      const warningStockValue = product.stock.warningStock ?? 0;

      // 3. STAGE 3: Structural Logical Check (Max vs Min/In-stock)
      // If maximum allowance falls below present items, block the API network call.
      if (maxStockValue < inStockValue) {
        console.warn(
          `API Sync aborted: maxStock (${maxStockValue}) cannot be lower than current inStock (${inStockValue}).`
        );
        return; 
      }

      try {
        await axios.put(
          `${API_BASE}/shelves/update-product/${shelfId}`,
          {
            productId,
            inStock: inStockValue,
            maxStock: maxStockValue,
            warningStock: warningStockValue,
          },
          { withCredentials: true },
        );
      } catch (error) {
        console.error("Error updating stock:", error);
        setDetailError(
          "Failed to save a stock update. Please refresh if values look wrong.",
        );
      }
    }, 500);
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

  useEffect(() => {
    const storedId = localStorage.getItem("selectedWarehouseId");
    if (storedId) {
      setSelectedWarehouseId(storedId);
      loadWarehouseDetail(storedId);
    }
  }, [loadWarehouseDetail]);

  // Clear any pending debounced stock-update timers on unmount so they
  // don't fire against an unmounted component's state.
  useEffect(() => {
    return () => {
      Object.values(stockTimers.current).forEach((timerId) =>
        clearTimeout(timerId),
      );
      stockTimers.current = {};
    };
  }, []);

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
              onAddRack={openCreateRack}
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
          onEditRack={openEditRack}
          onDeleteRack={handleDeleteRack}
          onToggleRackStatus={handleToggleRackStatus}
          onRestoreRack={handleRestoreRack}
          onEditShelf={handleEditShelf}
          onDeleteShelf={handleDeleteShelf}
          onToggleShelfStatus={handleToggleShelfStatus}
          onRestoreShelf={handleRestoreShelf}
          onSearchProducts={handleSearchProducts}
          onAddProductToShelf={handleAddProductToShelf}
          onRemoveProductFromShelf={handleRemoveProductFromShelf}
        />

        <WarehouseRackFormModal
          isOpen={rackModal.isOpen}
          mode={rackModal.mode}
          initialData={rackModal.initialData}
          onClose={closeRackModal}
          onSubmit={handleRackFormSubmit}
          onDelete={handleDeleteRack}
          onToggleStatus={handleToggleRackStatus}
          onRestore={handleRestoreRack}
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
          onChangeStatus={handleChangeStatus}
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
