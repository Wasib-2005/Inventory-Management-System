import express from "express";
import { getDashboardLiveData } from "../controllers/Dashboard.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasDashboardReadPermission"), getDashboardLiveData);

export default router;
