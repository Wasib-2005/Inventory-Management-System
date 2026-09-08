import express from "express";
import { logger } from "../config/logger.js";
import {
  getRoles,
  getRolesForEditing,
  getDeletedRoles,
} from "../controllers/Role/get_roles.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";
import {
  updateRole,
  deleteRole,
  createRole,
  restoreRole,
} from "../controllers/Role/CUD_role.controller.js";
import { checkPermission } from "../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasReadRolePermission"), getRoles);
router.get(
  "/role-for-edit",
  verifyAccess,
  checkPermission(["hasReadRolePermission"]),
  getRolesForEditing,
);
router.get("/recycle-bin", verifyAccess, checkPermission("hasReadRolePermission"), getDeletedRoles);

router.post("/create", verifyAccess, checkPermission("hasNewRoleAddPermission"), createRole);

router.patch("/update", verifyAccess, checkPermission("hasRolePermissionsChangePermission"), updateRole);
router.delete("/delete", verifyAccess, checkPermission("hasNewRoleDeletePermission"), deleteRole);
router.patch("/restore/:id", verifyAccess, checkPermission("hasNewRoleDeletePermission"), restoreRole);

export default router;
