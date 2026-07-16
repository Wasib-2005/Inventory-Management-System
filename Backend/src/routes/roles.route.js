import express from "express";
import { logger } from "../config/logger.js";
import {
  getRoles,
  getRolesForEditing,
} from "../controllers/Role/get_roles.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";
import {
  updateRole,
  deleteRole,
  createRole,
} from "../controllers/Role/CUD_role.controller.js";
import { checkPermission } from "../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/get", getRoles);
router.get(
  "/role-for-edit",
  verifyAccess,
  checkPermission(["hasReadRolePermission"]),
  getRolesForEditing,
);

router.post("/create", verifyAccess, createRole);

router.patch("/update", verifyAccess, updateRole);
router.delete("/delete", verifyAccess, deleteRole);

export default router;
