import express from "express";
import { logger } from "../../config/logger.js";
import { getAccountsAndPermissions } from "../../controllers/ManageAccounts.controllers/accountsAndPermissions.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/", verifyAccess, checkPermission("hasUserDataReadPermission"), getAccountsAndPermissions);

export default router;
 