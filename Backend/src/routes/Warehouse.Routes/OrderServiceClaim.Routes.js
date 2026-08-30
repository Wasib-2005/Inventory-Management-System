import express from "express";
import { createOrderServiceClaim, getOrderServiceClaim } from "../../controllers/OrderServiceClaim.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("/get", getOrderServiceClaim)
router.post("/create", verifyAccess, createOrderServiceClaim);

export default router;