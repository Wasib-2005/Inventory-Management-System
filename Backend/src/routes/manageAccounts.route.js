const express = require("express");
const {
  createAccountController,
} = require("../controllers/ManageAccounts.Controllers/createAccount.Controller");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware");
const router = express.Router();

router.post("/create_account", verifyAccess, createAccountController);

module.exports = router;
