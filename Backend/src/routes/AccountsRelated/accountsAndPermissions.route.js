const express = require("express");
const logger = require("../../config/logger.js");
const { getAccountsAndPermissions } = require("../../controllers/ManageAccounts.Controllers/accountsAndPermissions.Controller.js");

const router = express.Router();

router.get("/accounts-and-permissions", getAccountsAndPermissions);

module.exports = router;
