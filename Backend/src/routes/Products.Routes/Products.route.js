const express = require("express");
const {
  verifyAccess,
} = require("../../middlewares/verifyAccess.middleware.js");
const {
  createProduct,
  getProducts,
} = require("../../controllers/Products.controllers/Products.controller.js");
const {
  imageUploadPipeline,
} = require("../../middlewares/handleImageUploadPipeline.js");

const router = express.Router();

router.get("/get", getProducts);
router.post("/create", verifyAccess, imageUploadPipeline, createProduct);

module.exports = router;
