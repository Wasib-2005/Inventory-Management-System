const express = require("express");
const logger = require("../config/logger.js");
const { getRoles, changeRoles } = require("../controllers/roles.controller.js");

const router = express.Router();

router.get("/roles", getRoles);
router.patch("/change_role", changeRoles);

module.exports = router;
