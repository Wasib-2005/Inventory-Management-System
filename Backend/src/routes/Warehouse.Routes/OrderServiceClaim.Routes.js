import express from "express";
import { createOrderServiceClaim, getOrderServiceClaim, updateOrderServiceClaimStatus } from "../../controllers/OrderServiceClaim.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasClaimDataReadPermission"), getOrderServiceClaim)
router.post("/create", verifyAccess, checkPermission("hasClaimDataAddPermission"), createOrderServiceClaim);
router.patch("/update", verifyAccess, checkPermission("hasClaimDataChangePermission"), updateOrderServiceClaimStatus)

export default router;
