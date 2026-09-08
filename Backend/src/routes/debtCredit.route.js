import express from "express";
import { verifyAccess } from "../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../middlewares/checkPermission.middleware.js";
import {
  getDebtCredit,
  payDebtCredit,
  searchDebtCredit,
  totalDebt,
} from "../controllers/debtCredit.route.controller.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasDebtCreditReadPermission"), getDebtCredit);
router.get("/search", verifyAccess, checkPermission("hasDebtCreditReadPermission"), searchDebtCredit);
router.get("/total-debt", verifyAccess, checkPermission("hasDebtCreditReadPermission"), totalDebt);

router.patch("/pay/:id", verifyAccess, checkPermission("hasDebtCreditChangePermission"), payDebtCredit);

export default router;
