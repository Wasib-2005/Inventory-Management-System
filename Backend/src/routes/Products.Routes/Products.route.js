import express from "express";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
  createProduct,
  getProducts,
} from "../../controllers/Products.controllers/Products.controller.js";
import { imageUploadPipeline } from "../../middlewares/handleImageUploadPipeline.js";

const router = express.Router();

router.get("/get", getProducts);
router.post("/create", verifyAccess, imageUploadPipeline, createProduct);

export default router;
