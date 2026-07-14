import express from "express";
import {
  createCategory,
  getCategory,
} from "../../controllers/Products.controllers/Category.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.get("/", getCategory);
router.post("/", verifyAccess, createCategory);

export default router;
