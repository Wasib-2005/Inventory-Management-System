import { useState, useMemo, useEffect } from "react";
import {
  generateMockRacks,
  generateRack,
  findRemovedRacksWithProducts,
  isShelfFull,
  DEFAULT_MAX_PRODUCTS,
} from "../../Components/Warehouse/MockData";
import WarehouseHeader from "../../Components/Warehouse/WarehouseHeader";
import WarehouseProductSearch from "../../Components/Warehouse/WarehouseProductSearch";
import WarehouseRackContainer from "../../Components/Warehouse/WarehouseRack/WarehouseRackContainer";
import WarehouseRackModal from "../../Components/Warehouse/WarehouseRack/WarehouseRackModal";
import WarehouseSelectorModal from "../../Components/Warehouse/WarehouseSelectorModal/WarehouseSelectorModal";
import WarehouseFormModal from "../../Components/Warehouse/WarehouseFormModal";

import axios from "axios";
import sweetalert2 from "sweetalert2";

const normalizeWarehouse = (w) => ({
  id: w.warehouseId,
  mongoId: w._id,
  warehouseName: w.warehouseName,
  place: w.place,
  address: w.address,
  rackRows: w.rackRows,
  racksPerRow: w.racksPerRow,
  disabled: w.disabled ?? false,
});

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [racksByWarehouse, setRacksByWarehouse] = useState({});

  const [placeQuery, setPlaceQuery] = useState("");
  const [isWarehouseSelectorModalOpen, setIsWarehouseSelectorModalOpen] =
    useState(false);
  const [idQuery, setIdQuery] = useState("");
  const [selectedRackCode, setSelectedRackCode] = useState(null);
  const [highlightedRackCode, setHighlightedRackCode] = useState(null);
  const [shelfMaxProductsError, setShelfMaxProductsError] = useState(null);

  const [warehouseModal, setWarehouseModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0],
    [warehouses, selectedWarehouseId],
  );

  const racks =
    (selectedWarehouse && racksByWarehouse[selectedWarehouse.id]) || {};
  const selectedRack = selectedRackCode ? racks[selectedRackCode] : null;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchesPlace = (w.place || "")
        .toLowerCase()
        .includes(placeQuery.toLowerCase());
      const matchesId = (w.id || "")
        .toLowerCase()
        .includes(idQuery.toLowerCase());
      return matchesPlace && matchesId;
    });
  }, [warehouses, placeQuery, idQuery]);

  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouseId(warehouse.id);
    localStorage.setItem("selectedWarehouseId", warehouse.id);
    setSelectedRackCode(null);
    setHighlightedRackCode(null);
    setIsWarehouseSelectorModalOpen(false);
    setPlaceQuery("");
    setIdQuery("");
  };

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
        const existing = warehouses.find((w) => w.id === formData.warehouseId);

        if (existing) {
          setSelectedWarehouseId(existing.id);
          setSelectedRackCode(null);
          return;
        }

        const newWarehouse = {
          id: formData.warehouseId,
          warehouseName: formData.warehouseName,
          place: formData.place,
          address: formData.address,
          rackRows: formData.rackRows,
          racksPerRow: formData.racksPerRow,
        };

        console.log("Creating new warehouse:", newWarehouse);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses/create`,
          newWarehouse,
          { withCredentials: true },
        );

        if (response.status !== 201) {
          console.error("Failed to create warehouse:", response.data);
          return { error: "Failed to create warehouse. Please try again." };
        }

        setWarehouses((prev) => [...prev, newWarehouse]);
        setRacksByWarehouse((prev) => ({
          ...prev,
          [newWarehouse.id]: generateMockRacks(
            newWarehouse.rackRows,
            newWarehouse.racksPerRow,
          ),
        }));
        setSelectedWarehouseId(newWarehouse.id);
        setSelectedRackCode(null);
        handleCloseWarehouseModal();
        return;
      }

      const oldWarehouse = warehouses.find(
        (w) => w.id === formData.warehouseId,
      );
      const currentRacks = racksByWarehouse[formData.warehouseId] || {};

      console.log("Updating warehouse:", formData);

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses/update/${formData.warehouseId}`,
        formData,
        { withCredentials: true },
      );

      if (response.status !== 200) {
        console.error("Failed to update warehouse:", response.data);
        return { error: "Failed to update warehouse. Please try again." };
      }

      const blockedRacks = findRemovedRacksWithProducts(
        oldWarehouse.rackRows,
        oldWarehouse.racksPerRow,
        formData.rackRows,
        formData.racksPerRow,
        currentRacks,
      );

      if (blockedRacks.length > 0) {
        return {
          error: `Can't remove rack(s) that still hold products: ${blockedRacks.join(", ")}`,
        };
      }

      setWarehouses((prev) =>
        prev.map((w) =>
          w.id === formData.warehouseId
            ? {
                ...w,
                warehouseName: formData.warehouseName,
                place: formData.place,
                address: formData.address,
                rackRows: formData.rackRows,
                racksPerRow: formData.racksPerRow,
              }
            : w,
        ),
      );

      setRacksByWarehouse((prev) => {
        const resized = {};
        formData.rackRows.forEach((row) => {
          for (let i = 1; i <= formData.racksPerRow; i++) {
            const code = `${row}${i}`;
            resized[code] = currentRacks[code] || generateRack(code);
          }
        });
        return { ...prev, [formData.warehouseId]: resized };
      });
    } catch (error) {
      console.error("Error handling warehouse form submission:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  const handleSelectRack = (rack) => {
    setSelectedRackCode(rack.code);
    setShelfMaxProductsError(null);
  };

  const handleLocateRack = (rackCode) => {
    setSelectedRackCode(null);
    setHighlightedRackCode(rackCode);
    requestAnimationFrame(() => {
      document
        .getElementById(`rack-${rackCode}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setTimeout(() => setHighlightedRackCode(null), 2500);
  };

  const applyShelfMutation = (shelfId, mutateShelf) => {
    if (!selectedRackCode || !selectedWarehouse) return;

    setRacksByWarehouse((prev) => {
      const warehouseRacks = prev[selectedWarehouse.id];
      const rack = warehouseRacks[selectedRackCode];

      const shelves = rack.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        const mutated = mutateShelf(shelf);
        if (!mutated) return shelf;
        const itemCount = mutated.products.reduce((sum, p) => sum + p.qty, 0);
        const capacity = mutated.products.reduce((sum, p) => sum + p.maxQty, 0);
        return { ...mutated, itemCount, capacity };
      });

      const itemCount = shelves.reduce((sum, s) => sum + s.itemCount, 0);
      const capacity = shelves.reduce((sum, s) => sum + s.capacity, 0);

      return {
        ...prev,
        [selectedWarehouse.id]: {
          ...warehouseRacks,
          [selectedRackCode]: { ...rack, shelves, itemCount, capacity },
        },
      };
    });
  };

  // product: { id, name, qty, maxQty }
  const handleAddProduct = (shelfId, product) => {
    applyShelfMutation(shelfId, (shelf) => {
      if (isShelfFull(shelf)) return null;
      return { ...shelf, products: [...shelf.products, product] };
    });
  };

  const handleUpdateProduct = (shelfId, productId, field, rawValue) => {
    const value = Math.max(0, Number(rawValue) || 0);

    applyShelfMutation(shelfId, (shelf) => ({
      ...shelf,
      products: shelf.products.map((p) => {
        if (p.id !== productId) return p;

        const updated = { ...p, [field]: value };

        if (field === "qty" && updated.qty > updated.maxQty) {
          updated.maxQty = updated.qty;
        }
        if (field === "maxQty" && updated.maxQty < updated.qty) {
          updated.maxQty = updated.qty;
        }

        return updated;
      }),
    }));
  };

  const handleUpdateShelfMaxProducts = (shelfId, rawValue) => {
    const nextMax = Math.max(1, Number(rawValue) || 1);
    setShelfMaxProductsError(null);

    if (!selectedRackCode || !selectedWarehouse) return;

    const rack = racks[selectedRackCode];
    const shelf = rack?.shelves.find((s) => s.id === shelfId);
    if (!shelf) return;

    if (nextMax < shelf.products.length) {
      setShelfMaxProductsError(
        `${shelf.name}: can't set max below its current ${shelf.products.length} products.`,
      );
      return;
    }

    setRacksByWarehouse((prev) => {
      const warehouseRacks = prev[selectedWarehouse.id];
      const targetRack = warehouseRacks[selectedRackCode];

      const shelves = targetRack.shelves.map((s) =>
        s.id === shelfId ? { ...s, maxProducts: nextMax } : s,
      );

      return {
        ...prev,
        [selectedWarehouse.id]: {
          ...warehouseRacks,
          [selectedRackCode]: { ...targetRack, shelves },
        },
      };
    });
  };

  const handleAddShelf = (maxProducts = DEFAULT_MAX_PRODUCTS) => {
    if (!selectedRackCode || !selectedWarehouse) return;

    setRacksByWarehouse((prev) => {
      const warehouseRacks = prev[selectedWarehouse.id];
      const rack = warehouseRacks[selectedRackCode];

      const newShelf = {
        id: `${rack.code}-S${rack.shelves.length + 1}-${Date.now()}`,
        name: `Shelf ${rack.shelves.length + 1}`,
        capacity: 0,
        itemCount: 0,
        maxProducts,
        products: [],
      };

      const shelves = [...rack.shelves, newShelf];
      const capacity = shelves.reduce((sum, s) => sum + s.capacity, 0);

      return {
        ...prev,
        [selectedWarehouse.id]: {
          ...warehouseRacks,
          [selectedRackCode]: { ...rack, shelves, capacity },
        },
      };
    });
  };

  const handleDeleteWarehouse = async (warehouseId, mongoId) => {
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

      if (!confirmDelete.isConfirmed) {
        return;
      }
      console.log("Deleting warehouse:", warehouseId, mongoId);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses/delete/${mongoId}`,
        { withCredentials: true },
      );

      if (response.status !== 200) {
        console.error("Failed to delete warehouse:", response.data);
        return { error: "Failed to delete warehouse. Please try again." };
      }

      console.log("Warehouse deleted successfully:", Warehouse);
      setWarehouses((prev) => prev.filter((w) => w.id !== warehouseId));
      setRacksByWarehouse((prev) => {
        const updated = { ...prev };
        delete updated[warehouseId];
        return updated;
      });

      if (selectedWarehouseId === warehouseId) {
        setSelectedWarehouseId(null);
        localStorage.removeItem("selectedWarehouseId");
      }

      handleCloseWarehouseModal();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }
  };

  useEffect(() => {
    const getWarehouseData = async () => {
      setIsLoadingWarehouses(true);
      setLoadError(null);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses`,
          { withCredentials: true },
        );

        // Defensive filter - backend soft-deletes via `disabled`, so don't
        // show those even if an endpoint ever forgets to filter server-side.
        const normalized = (response.data.data || [])
          .filter((w) => !w.disabled)
          .map(normalizeWarehouse);

        setWarehouses(normalized);

        // Racks API isn't wired in yet - keep mock racks, but key them by
        // the REAL warehouse ids so they line up with what was just fetched.
        setRacksByWarehouse(() => {
          const map = {};
          normalized.forEach((w) => {
            map[w.id] = generateMockRacks(w.rackRows, w.racksPerRow);
          });
          return map;
        });
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
        setLoadError("Couldn't load warehouses. Please try again.");
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    getWarehouseData();
  }, []);

  useEffect(() => {
    const selectedWarehouseInLS = localStorage.getItem("selectedWarehouseId");
    if (selectedWarehouseInLS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedWarehouseId(selectedWarehouseInLS);
    }
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

  if (!selectedWarehouse) {
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
          onOpenEditModal={() => handleEditWarehouse(selectedWarehouse)}
        />
        <WarehouseProductSearch racks={racks} onLocateRack={handleLocateRack} />
        <WarehouseRackContainer
          racks={racks}
          onSelectRack={handleSelectRack}
          rackRows={selectedWarehouse.rackRows}
          racksPerRow={selectedWarehouse.racksPerRow}
          highlightedRackCode={highlightedRackCode}
        />
        <WarehouseRackModal
          rack={selectedRack}
          isOpen={!!selectedRack}
          onClose={() => setSelectedRackCode(null)}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onUpdateShelfMaxProducts={handleUpdateShelfMaxProducts}
          shelfMaxProductsError={shelfMaxProductsError}
          onAddShelf={handleAddShelf}
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
