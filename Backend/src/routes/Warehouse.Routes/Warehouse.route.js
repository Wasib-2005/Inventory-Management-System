import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseById,
  restoreWarehouse,
} from "../../controllers/Warehouse.controllers/Warehouse.controllers.js";

const router = express.Router();

router.get("/", getAllWarehouses);
router.get("/:warehouseId", getWarehouseById);
router.post("/create", verifyAccess, createWarehouse);
router.put("/update/:warehouseId", verifyAccess, updateWarehouse);
router.delete("/delete/:warehouseId", verifyAccess, deleteWarehouse);
router.patch("/:warehouseId", restoreWarehouse);

export default router;
