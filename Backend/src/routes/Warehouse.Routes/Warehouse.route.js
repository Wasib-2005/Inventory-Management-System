import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseById_Stock,
  restoreWarehouse,
  disabledEnabledWarehouse,
} from "../../controllers/Warehouse.controllers/Warehouse.controller.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasWarehouseDataReadPermission"), getAllWarehouses);
router.get("/get/:id", verifyAccess, checkPermission("hasWarehouseDataReadPermission"), getWarehouseById_Stock);
router.post("/create", verifyAccess, checkPermission("hasWarehouseDataAddPermission"), createWarehouse);
router.put("/update/:id", verifyAccess, checkPermission("hasWarehouseDataChangePermission"), updateWarehouse);
router.delete("/delete/:id", verifyAccess, checkPermission("hasWarehouseDataDeletePermission"), deleteWarehouse);
router.patch("/restore/:id", verifyAccess, checkPermission("hasWarehouseDataChangePermission"), restoreWarehouse);
router.patch("/status/:id", verifyAccess, checkPermission("hasWarehouseDataChangePermission"), disabledEnabledWarehouse);

export default router;
