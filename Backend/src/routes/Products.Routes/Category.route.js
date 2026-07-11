const express = require("express");
const {
  createCategory,
  getCategory,
} = require("../../controllers/Products.controllers/Category.controller.js");
const {
  verifyAccess,
} = require("../../middlewares/verifyAccess.middleware.js");

const router = express.Router();

router.get("/", getCategory);
router.post("/", verifyAccess, createCategory);

module.exports = router;
