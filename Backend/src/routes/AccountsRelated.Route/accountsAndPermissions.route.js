import express from "express";
import { logger } from "../../config/logger.js";
import { getAccountsAndPermissions } from "../../controllers/ManageAccounts.controllers/accountsAndPermissions.controller.js";

const router = express.Router();

router.get("/", getAccountsAndPermissions);

export default router;
 