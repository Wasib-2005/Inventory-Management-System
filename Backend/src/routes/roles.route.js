const express = require("express");
const logger = require("../config/logger.js");
const {
  getRoles,
  changeRoles,
  getRolesForEditing,
} = require("../controllers/roles.controller.js");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware.js");

const router = express.Router();

router.get("/roles", getRoles);
router.get("/get-role-for-edit",  getRolesForEditing);
router.patch("/change_role", changeRoles);

module.exports = router;
