const express = require("express");
const { verifyAccess } = require("../../middlewares/verifyAccess.middleware");
const {
  createWarehouse,
  getAllWarehouses,
} = require("../../controllers/Warehouse.Controllers/Warehouse.Controllers");
const router = express.Router();

router.post("/create", verifyAccess, createWarehouse);
router.get("/", verifyAccess, getAllWarehouses);

module.exports = router;
