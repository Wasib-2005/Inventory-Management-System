import express from "express";
import {
  completeOrder,
  createOrder,
  getOrderStream,
  payOrder,
} from "../controllers/Order.controller/Order.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("/order-stream-today", getOrderStream);
router.post("/create-inside", verifyAccess, createOrder);
router.patch("/complete/:id", verifyAccess, completeOrder);
router.patch("/pay/:id", verifyAccess, payOrder)

export default router;
