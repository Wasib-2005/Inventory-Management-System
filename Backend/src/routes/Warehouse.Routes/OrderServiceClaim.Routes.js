import express from "express";
import { createOrderServiceClaim } from "../../controllers/OrderServiceClaim.controller.js";

const router = express.Router();

router.post("/create", createOrderServiceClaim);

export default router;