const express = require("express");
const {
  createAccountController,
} = require("../controllers/ManageAccounts.Controllers/createAccount.Controller.js");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware.js");
const {
  updateAccount,
} = require("../controllers/ManageAccounts.Controllers/updateAccount.Controller.js");
const router = express.Router();

router.post("/create_account", verifyAccess, createAccountController);
router.post("/update_account", verifyAccess, updateAccount);

module.exports = router;
