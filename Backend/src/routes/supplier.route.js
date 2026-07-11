const express = require("express");
const {
  getSuppliers,
  createSupplier,
} = require("../controllers/supplier.controller.js");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware.js");

const router = express.Router();

router.get("", verifyAccess, getSuppliers);
router.post("", verifyAccess, createSupplier);

module.exports = router;
