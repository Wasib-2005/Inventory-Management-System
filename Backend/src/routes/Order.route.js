import express from "express";
import { createOrder } from "../controllers/Order.controller/Order.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.post("/create-inside", verifyAccess, createOrder);

export default router;
