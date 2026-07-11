const express = require("express");
const { verifyAccess } = require("../../middlewares/verifyAccess.middleware");
const {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
} = require("../../controllers/Warehouse.controllers/Warehouse.controllers");
const router = express.Router();

router.get("/", verifyAccess, getAllWarehouses);
router.post("/create", verifyAccess, createWarehouse);
router.put("/update/:warehouseId", verifyAccess, updateWarehouse);
router.delete("/delete/:warehouseId", verifyAccess, deleteWarehouse);

module.exports = router;
