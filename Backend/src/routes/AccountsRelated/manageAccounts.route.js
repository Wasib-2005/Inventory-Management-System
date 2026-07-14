import express from "express";
import { createAccountController } from "../../controllers/ManageAccounts.controllers/createAccount.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { updateAccount } from "../../controllers/ManageAccounts.controllers/updateAccount.controller.js";
import { updateOwnData } from "../../controllers/ManageAccounts.controllers/updateOwnData.controller.js";

const router = express.Router();

router.post("/create_account", verifyAccess, createAccountController);
router.post("/update_account", verifyAccess, updateAccount);
router.post("/update_own_data", verifyAccess, updateOwnData);

export default router;
