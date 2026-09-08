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
import { checkPermission } from "../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/order-stream-today", verifyAccess, checkPermission("hasOrderDataReadPermission"), getOrderStream);
router.get("/all-order", verifyAccess, checkPermission("hasOrderDataReadPermission"), getAllOrder);
router.get("/order-by-id/:id", verifyAccess, checkPermission("hasOrderDataReadPermission"), getOrderById);
router.post("/create-inside", verifyAccess, checkPermission("hasOrderDataAddPermission"), createOrder);
router.patch("/complete/:id", verifyAccess, checkPermission("hasOrderDataChangePermission"), completeOrder);
router.patch("/pay/:id", verifyAccess, checkPermission("hasOrderDataChangePermission"), payOrder)

export default router;
