const express = require("express");
const {
  createAccountController,
} = require("../controllers/ManageAccounts.Controllers/createAccount.Controller");
const router = express.Router();

router.post("/create_account", createAccountController);

module.exports = router;
