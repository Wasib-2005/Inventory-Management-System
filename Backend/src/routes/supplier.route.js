import express from "express";
import {
  getSuppliers,
  createSupplier,
} from "../controllers/supplier.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("", verifyAccess, getSuppliers);
router.post("", verifyAccess, createSupplier);

export default router;
