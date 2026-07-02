import { useState, useMemo } from "react";
import {
  MOCK_WAREHOUSES,
  generateMockRacks,
  generateRack,
  findRemovedRacksWithProducts,
} from "../../Components/Warehouse/MockData";
import WarehouseHeader from "../../Components/Warehouse/WarehouseHeader";
import WarehouseProductSearch from "../../Components/Warehouse/WarehouseProductSearch";
import WarehouseRackContainer from "../../Components/Warehouse/WarehouseRack/WarehouseRackContainer";
import WarehouseRackModal from "../../Components/Warehouse/WarehouseRack/WarehouseRackModal";
import WarehouseSelectorModal from "../../Components/Warehouse/WarehouseSelectorModal";
import WarehouseCreateModal from "../../Components/Warehouse/WarehouseCreateModal";

import axios from "axios";

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    MOCK_WAREHOUSES[0].id,
  );

  const [racksByWarehouse, setRacksByWarehouse] = useState(() => {
    const map = {};
    MOCK_WAREHOUSES.forEach((w) => {
      map[w.id] = generateMockRacks(w.rackRows, w.racksPerRow);
    });
    return map;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [selectedRackCode, setSelectedRackCode] = useState(null);
  const [highlightedRackCode, setHighlightedRackCode] = useState(null);

  const [warehouseModal, setWarehouseModal] = useState({
    isOpen: false,
    mode: "create",
    initialData: null,
  });

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0],
    [warehouses, selectedWarehouseId],
  );

  const racks = racksByWarehouse[selectedWarehouseId] || {};
  const selectedRack = selectedRackCode ? racks[selectedRackCode] : null;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchesPlace = w.place
        .toLowerCase()
        .includes(placeQuery.toLowerCase());
      const matchesId = w.id.toLowerCase().includes(idQuery.toLowerCase());
      return matchesPlace && matchesId;
    });
  }, [warehouses, placeQuery, idQuery]);

  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouseId(warehouse.id);
    setSelectedRackCode(null);
    setHighlightedRackCode(null);
    setIsModalOpen(false);
    setPlaceQuery("");
    setIdQuery("");
  };

  const handleOpenCreateModal = () => {
    setWarehouseModal({ isOpen: true, mode: "create", initialData: null });
    setIsModalOpen(false);
  };

  const handleEditWarehouse = (warehouse) => {
    setWarehouseModal({ isOpen: true, mode: "edit", initialData: warehouse });
    setIsModalOpen(false);
  };

  const handleCloseWarehouseModal = () => {
    setWarehouseModal({ isOpen: false, mode: "create", initialData: null });
  };

  const handleWarehouseFormSubmit = async (formData) => {
    console.log("Warehouse form submitted:", formData);
    if (warehouseModal.mode === "create") {
      try {
        axios.post(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses/create`,
          formData,
          {
            withCredentials: true,
          },
        );
      } catch (error) {
        console.error("Error creating warehouse:", error);
      }

      const existing = warehouses.find((w) => w.id === formData.warehouseId);

      if (existing) {
        setSelectedWarehouseId(existing.id);
        setSelectedRackCode(null);
        return;
      }

      const newWarehouse = {
        id: formData.warehouseId,
        place: formData.place,
        address: formData.address,
        rackRows: formData.rackRows,
        racksPerRow: formData.racksPerRow,
      };

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
      return;
    }

    // Edit mode: block shrinking rows/racksPerRow if it would drop a rack
    // that still has products in it.
    const oldWarehouse = warehouses.find((w) => w.id === formData.warehouseId);
    const currentRacks = racksByWarehouse[formData.warehouseId] || {};

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
  };

  const handleSelectRack = (rack) => {
    setSelectedRackCode(rack.code);
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

  // product: { id, name, qty, maxQty }
  const handleAddProduct = (shelfId, product) => {
    if (!selectedRackCode) return;

    setRacksByWarehouse((prev) => {
      const warehouseRacks = prev[selectedWarehouseId];
      const rack = warehouseRacks[selectedRackCode];

      const shelves = rack.shelves.map((shelf) => {
        if (shelf.id !== shelfId) return shelf;
        const products = [...shelf.products, product];
        const itemCount = products.reduce((sum, p) => sum + p.qty, 0);
        const capacity = products.reduce((sum, p) => sum + p.maxQty, 0);
        return { ...shelf, products, itemCount, capacity };
      });

      const itemCount = shelves.reduce((sum, s) => sum + s.itemCount, 0);
      const capacity = shelves.reduce((sum, s) => sum + s.capacity, 0);

      return {
        ...prev,
        [selectedWarehouseId]: {
          ...warehouseRacks,
          [selectedRackCode]: { ...rack, shelves, itemCount, capacity },
        },
      };
    });
  };

  const handleAddShelf = () => {
    if (!selectedRackCode) return;

    setRacksByWarehouse((prev) => {
      const warehouseRacks = prev[selectedWarehouseId];
      const rack = warehouseRacks[selectedRackCode];

      const newShelf = {
        id: `${rack.code}-S${rack.shelves.length + 1}-${Date.now()}`,
        name: `Shelf ${rack.shelves.length + 1}`,
        capacity: 0,
        itemCount: 0,
        products: [],
      };

      const shelves = [...rack.shelves, newShelf];
      const capacity = shelves.reduce((sum, s) => sum + s.capacity, 0);

      return {
        ...prev,
        [selectedWarehouseId]: {
          ...warehouseRacks,
          [selectedRackCode]: { ...rack, shelves, capacity },
        },
      };
    });
  };

  return (
    <div>
      <div className="w-full min-h-screen p-4 sm:p-6 flex flex-col gap-5">
        <WarehouseHeader
          selectedWarehouse={selectedWarehouse}
          onOpenSwitchModal={() => setIsModalOpen(true)}
          onOpenCreateModal={handleOpenCreateModal}
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
          onAddShelf={handleAddShelf}
        />
        <WarehouseSelectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          placeQuery={placeQuery}
          setPlaceQuery={setPlaceQuery}
          idQuery={idQuery}
          setIdQuery={setIdQuery}
          filteredWarehouses={filteredWarehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={handleSelectWarehouse}
          onCreateWarehouse={handleOpenCreateModal}
          onEditWarehouse={handleEditWarehouse}
        />
        <WarehouseCreateModal
          isOpen={warehouseModal.isOpen}
          mode={warehouseModal.mode}
          initialData={warehouseModal.initialData}
          onClose={handleCloseWarehouseModal}
          onSubmit={handleWarehouseFormSubmit}
        />
      </div>
    </div>
  );
};

export default Warehouse;
