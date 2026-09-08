import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  restoreCategory,
  updateCategory,
} from "../../controllers/Products.controllers/Category.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/", verifyAccess, checkPermission("hasCategoryDataReadPermission"), getCategory);
router.post("/", verifyAccess, checkPermission("hasCategoryDataAddPermission"), createCategory);

router.patch("/update/:id", verifyAccess, checkPermission("hasCategoryDataChangePermission"), updateCategory);
router.delete("/:id", verifyAccess, checkPermission("hasCategoryDataDeletePermission"), deleteCategory);
router.patch("/restore/:id", verifyAccess, checkPermission("hasCategoryDataChangePermission"), restoreCategory);

export default router;
