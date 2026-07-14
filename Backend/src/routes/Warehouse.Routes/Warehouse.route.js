import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
} from "../../controllers/Warehouse.controllers/Warehouse.controllers.js";

const router = express.Router();

router.get("/", verifyAccess, getAllWarehouses);
router.post("/create", verifyAccess, createWarehouse);
router.put("/update/:warehouseId", verifyAccess, updateWarehouse);
router.delete("/delete/:warehouseId", verifyAccess, deleteWarehouse);

export default router;
