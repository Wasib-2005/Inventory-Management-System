const express = require("express");
const { verifyAccess } = require("../../middlewares/verifyAccess.middleware");
const { createWarehouse } = require("../../controllers/Warehouse.Controllers/Warehouse.Controllers");
const router = express.Router();

router.post("/create", verifyAccess, createWarehouse);


module.exports = router;
