import { useState, useMemo } from "react";
import { MOCK_WAREHOUSES } from "../../Components/Warehouse/Mockdata";
import WarehouseHeader from "../../Components/Warehouse/WarehouseHeader";
import WarehouseRackContainer from "../../Components/Warehouse/WarehouseRack/WarehouseRackContainer";
import WarehouseRackDetailPanel from "../../Components/Warehouse/WarehouseRackDetailPanel";
import WarehouseSelectorModal from "../../Components/Warehouse/WarehouseSelectorModal";
import WarehouseCreateModal from "../../Components/Warehouse/WarehouseCreateModal";

const Warehouse = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(
    MOCK_WAREHOUSES[0],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [selectedRack, setSelectedRack] = useState(null);
  const [isOpenWarehouseCreateModal, setIsOpenWarehouseCreateModal] =
    useState(false);

  const filteredWarehouses = useMemo(() => {
    return MOCK_WAREHOUSES.filter((w) => {
      const matchesPlace = w.place
        .toLowerCase()
        .includes(placeQuery.toLowerCase());
      const matchesId = w.id.toLowerCase().includes(idQuery.toLowerCase());
      return matchesPlace && matchesId;
    });
  }, [placeQuery, idQuery]);

  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setSelectedRack(null);
    setIsModalOpen(false);
    setPlaceQuery("");
    setIdQuery("");
  };

  const handleCreateWarehouse = () => {
    setIsOpenWarehouseCreateModal(!isOpenWarehouseCreateModal);
    setIsModalOpen(false);
    console.log("Create new warehouse");
  };

  return (
    <div>
      <div className="w-full min-h-screen p-4 sm:p-6 flex flex-col gap-5">
        <WarehouseHeader
          selectedWarehouse={selectedWarehouse}
          onOpenModal={() => setIsModalOpen(true)}
          handleCreateWarehouse={handleCreateWarehouse}
        />

        <WarehouseRackContainer onSelectRack={setSelectedRack} />

        <WarehouseRackDetailPanel
          selectedRack={selectedRack}
          onClose={() => setSelectedRack(null)}
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
          onCreateWarehouse={handleCreateWarehouse}
        />
        <WarehouseCreateModal
          isOpen={isOpenWarehouseCreateModal}
          onClose={() => setIsOpenWarehouseCreateModal((prev) => !prev)}
        />
      </div>
    </div>
  );
};

export default Warehouse;
