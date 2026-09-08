import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
  createCycleCount,
  getCycleCounts,
  verifyCycleCount,
  recordCycleCountDiscrepancy,
} from "../../controllers/Task.controllers/CycleCount.controller.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasCycleCountDataReadPermission"), getCycleCounts);
router.post("/create", verifyAccess, checkPermission("hasCycleCountDataAddPermission"), createCycleCount);
router.patch("/:id/verify", verifyAccess, checkPermission("hasCycleCountDataChangePermission"), verifyCycleCount);
router.patch("/:id/discrepancy", verifyAccess, checkPermission("hasCycleCountDataChangePermission"), recordCycleCountDiscrepancy);

export default router;
