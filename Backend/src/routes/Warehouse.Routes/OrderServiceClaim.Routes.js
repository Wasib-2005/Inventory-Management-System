import express from "express";
import { createOrderServiceClaim, getOrderServiceClaim, updateOrderServiceClaimStatus } from "../../controllers/OrderServiceClaim.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("/get", getOrderServiceClaim)
router.post("/create", verifyAccess, createOrderServiceClaim);
router.patch("/update", verifyAccess, updateOrderServiceClaimStatus)

export default router;
