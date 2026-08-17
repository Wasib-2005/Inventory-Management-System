import express from "express";
import {
  completeOrder,
  createOrder,
  getAllOrder,
  getOrderById,
  getOrderStream,
  payOrder,
} from "../controllers/Order.controller/Order.controller.js";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("/order-stream-today", getOrderStream);
router.get("/all-order", verifyAccess, getAllOrder);
router.get("/order-by-id/:id", getOrderById);
router.post("/create-inside", verifyAccess, createOrder);
router.patch("/complete/:id", verifyAccess, completeOrder);
router.patch("/pay/:id", verifyAccess, payOrder)

export default router;
