const express = require("express");
const logger = require("../config/logger.js");
const {
  getAccountsAndPermissions,
} = require("../controllers/AccountsAndPermissions.Controller.js");

const router = express.Router();

router.get("/accounts-and-permissions", getAccountsAndPermissions);

module.exports = router;
