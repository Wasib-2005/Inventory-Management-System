import express from "express";
import { logger } from "../../config/logger.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { getManagers } from "../../controllers/ManageAccounts.controllers/managers.controller.js";

const router = express.Router();

router.get("/get-managers", verifyAccess, getManagers);

export default router;
