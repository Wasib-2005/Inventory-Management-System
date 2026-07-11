const express = require("express");
const logger = require("../../config/logger.js");
const { verifyAccess } = require("../../middlewares/verifyAccess.middleware.js");
const { getManagers } = require("../../controllers/ManageAccounts.controllers/managers.controller.js");

const router = express.Router();

router.get("/get-managers", verifyAccess, getManagers);

module.exports = router;
