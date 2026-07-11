const express = require("express");
const {
  createAccountController,
} = require("../../controllers/ManageAccounts.controllers/createAccount.controller.js");
const { verifyAccess } = require("../../middlewares/verifyAccess.middleware.js");
const {
  updateAccount,
} = require("../../controllers/ManageAccounts.controllers/updateAccount.controller.js");
const { updateOwnData } = require("../../controllers/ManageAccounts.controllers/updateOwnData.controller.js");


const router = express.Router();

router.post("/create_account", verifyAccess, createAccountController);
router.post("/update_account", verifyAccess, updateAccount);
router.post("/update_own_data",verifyAccess,updateOwnData)

module.exports = router;
