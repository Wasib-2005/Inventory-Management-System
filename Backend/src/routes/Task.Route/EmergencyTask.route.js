import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
  createEmergencyTask,
  getEmergencyTasks,
  updateEmergencyTask,
} from "../../controllers/Task.controllers/EmergencyTask.controller.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasEmergencyTaskReadPermission"), getEmergencyTasks);
router.post("/create", verifyAccess, checkPermission("hasEmergencyTaskAddPermission"), createEmergencyTask);
router.patch("/:id", verifyAccess, checkPermission("hasEmergencyTaskChangePermission"), updateEmergencyTask);

export default router;
