import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createProduct,
  getProducts,
  getProductsId,
  updateProduct,
} from "../../controllers/Products.controllers/Products.controller.js";
import { imageUploadPipeline } from "../../middlewares/handleImageUploadPipeline.js";

const router = express.Router();

router.get("/get", getProducts);
router.get("/get/:id", getProductsId);
router.post("/create", verifyAccess, imageUploadPipeline, createProduct);
router.put(
  "/update/:productId",
  verifyAccess,
  imageUploadPipeline,
  updateProduct,
);

export default router;
