import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseById,
  restoreWarehouse,
  disabledEnabledWarehouse,
} from "../../controllers/Warehouse.controllers/Warehouse.controller.js";

const router = express.Router();

router.get("/get", getAllWarehouses);
router.get("/get/:id", getWarehouseById);
router.post("/create", verifyAccess, createWarehouse);
router.put("/update/:id", verifyAccess, updateWarehouse);
router.delete("/delete/:id", verifyAccess, deleteWarehouse);
router.patch("/restore/:id", verifyAccess, restoreWarehouse);
router.patch("/status/:id", verifyAccess, disabledEnabledWarehouse);

export default router;
