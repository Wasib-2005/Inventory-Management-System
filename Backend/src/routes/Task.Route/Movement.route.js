import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
  createMovement,
  getMovements,
  verifyMovement,
  updateMovement,
  recordMovementDiscrepancy,
} from "../../controllers/Task.controllers/Movement.controller.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasMovementDataReadPermission"), getMovements);
router.post("/create", verifyAccess, checkPermission("hasMovementDataAddPermission"), createMovement);
router.patch("/:id", verifyAccess, checkPermission("hasMovementDataChangePermission"), updateMovement);
router.patch("/:id/verify", verifyAccess, checkPermission("hasMovementDataChangePermission"), verifyMovement);
router.patch("/:id/discrepancy", verifyAccess, checkPermission("hasMovementDataChangePermission"), recordMovementDiscrepancy);

export default router;
