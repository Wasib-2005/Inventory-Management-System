import express from "express";
import {
  getDebtCredit,
  payDebtCredit,
  searchDebtCredit,
  totalDebt,
} from "../controllers/debtCredit.route.controller.js";

const router = express.Router();

router.get("/get", getDebtCredit);
router.get("/search", searchDebtCredit);
router.get("/total-debt", totalDebt);

router.patch("/pay/:id", payDebtCredit);

export default router;
