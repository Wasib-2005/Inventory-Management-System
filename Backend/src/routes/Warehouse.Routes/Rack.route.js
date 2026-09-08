import express from "express";
import {
  createRack,
  deleteRack,
  restoreRack,
  updateRack,
} from "../../controllers/Warehouse.controllers/Rack.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.post("/create", verifyAccess, checkPermission("hasRackDataAddPermission"), createRack);
router.put("/update/:id", verifyAccess, checkPermission("hasRackDataChangePermission"), updateRack);
router.delete("/delete/:id", verifyAccess, checkPermission("hasRackDataDeletePermission"), deleteRack);
router.patch("/restore/:id", verifyAccess, checkPermission("hasRackDataChangePermission"), restoreRack);

export default router;
