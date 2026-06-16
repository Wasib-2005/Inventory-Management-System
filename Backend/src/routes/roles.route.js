const express = require("express");
const logger = require("../config/logger.js");
const {
  getRoles,
  getRolesForEditing,
} = require("../controllers/Role/get_roles.controller.js");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware.js");
const {
  updateRole,
  deleteRole,
  createRole,
} = require("../controllers/Role/CUD_role.controller.js");
const {
  checkPermission,
} = require("../middlewares/checkPermission.middleware.js");

const router = express.Router();

router.get("/roles", getRoles);
router.get(
  "/get-role-for-edit",
  verifyAccess,
  checkPermission(["hasReadRolePermission",]),
  getRolesForEditing,
);

router.post("/create-role", verifyAccess, createRole);

router.patch("/update_role", verifyAccess, updateRole);
router.delete("/delete-role", verifyAccess, deleteRole);

module.exports = router;
