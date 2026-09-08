import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from "../controllers/supplier.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("", verifyAccess, checkPermission("hasSupplierDataReadPermission"), getSuppliers);
router.post("", verifyAccess, checkPermission("hasSupplierDataAddPermission"), createSupplier);

router.patch("/update/:id", verifyAccess, checkPermission("hasSupplierDataChangePermission"), updateSupplier);
router.delete("/:id", verifyAccess, checkPermission("hasSupplierDataDeletePermission"), deleteSupplier);
router.patch("/restore/:id", verifyAccess, checkPermission("hasSupplierDataChangePermission"), restoreSupplier);

export default router;
