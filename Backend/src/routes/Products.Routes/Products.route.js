import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductsId,
  getProductTags,
  getDeletedProducts,
  restoreProduct,
  updateProduct,
} from "../../controllers/Products.controllers/Products.controller.js";
import { imageUploadPipeline } from "../../middlewares/handleImageUploadPipeline.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";

const router = express.Router();

router.get("/get", verifyAccess, checkPermission("hasReadProductPermission"), getProducts);
router.get("/tags", verifyAccess, checkPermission("hasReadProductPermission"), getProductTags);
router.get("/recycle-bin", verifyAccess, checkPermission("hasReadProductPermission"), getDeletedProducts);
router.get("/get/:id", verifyAccess, checkPermission("hasReadProductPermission"), getProductsId);
router.post("/create", verifyAccess, checkPermission("hasAddProductPermission"), imageUploadPipeline, createProduct);
router.put(
  "/update/:productId",
  verifyAccess,
  checkPermission("hasProductChangePermission"),
  imageUploadPipeline,
  updateProduct,
);
router.delete("/delete/:productId", verifyAccess, checkPermission("hasProductDeletePermission"), deleteProduct);
router.patch("/restore/:productId", verifyAccess, checkPermission("hasProductChangePermission"), restoreProduct);

export default router;
