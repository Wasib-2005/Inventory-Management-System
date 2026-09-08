import express from "express";
import { createAccountController } from "../../controllers/ManageAccounts.controllers/createAccount.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { updateAccount } from "../../controllers/ManageAccounts.controllers/updateAccount.controller.js";
import { updateOwnData } from "../../controllers/ManageAccounts.controllers/updateOwnData.controller.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
  deleteAccount,
  getDeletedAccounts,
  restoreAccount,
} from "../../controllers/ManageAccounts.controllers/deleteAccount.controller.js";

const router = express.Router();

router.post("/create_account", verifyAccess, checkPermission("hasUserDataAddPermission"), createAccountController);
router.post("/update_account", verifyAccess, checkPermission("hasUserDataChangePermission"), updateAccount);
router.delete("/delete_account/:id", verifyAccess, checkPermission("hasUserDataDeletePermission"), deleteAccount);
router.get("/recycle-bin/users", verifyAccess, checkPermission("hasUserDataReadPermission"), getDeletedAccounts);
router.patch("/restore_account/:id", verifyAccess, checkPermission("hasUserDataDeletePermission"), restoreAccount);
router.post("/update_own_data", verifyAccess, updateOwnData);

export default router;
 