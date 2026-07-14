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

router.get("/roles", getRoles);
router.get(
  "/get-role-for-edit",
  verifyAccess,
  checkPermission(["hasReadRolePermission"]),
  getRolesForEditing,
);

router.post("/create-role", verifyAccess, createRole);

router.patch("/update_role", verifyAccess, updateRole);
router.delete("/delete-role", verifyAccess, deleteRole);

export default router;
