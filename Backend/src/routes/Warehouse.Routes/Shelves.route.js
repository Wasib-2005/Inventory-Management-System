import express from "express";
import {
  addShelvesProductStock,
  deleteShelvesProductStock,
  updateShelvesProductStock,
} from "../../controllers/Warehouse.controllers/Shelves.controller/Shelves.product.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import { checkPermission } from "../../middlewares/checkPermission.middleware.js";
import {
    createShelves,
  deleteShelves,
  restoreShelves,
  updateShelves,
} from "../../controllers/Warehouse.controllers/Shelves.controller/Shelves.controller.js";

const router = express.Router();

//Shelves
router.post("/create", verifyAccess, checkPermission("hasShelveDataAddPermission"), createShelves);
router.put("/update/:id", verifyAccess, checkPermission("hasShelveDataChangePermission"), updateShelves);
router.delete("/delete/:id", verifyAccess, checkPermission("hasShelveDataDeletePermission"), deleteShelves);
router.patch("/restore/:id", verifyAccess, checkPermission("hasShelveDataChangePermission"), restoreShelves);

// For product
router.post("/add-product", verifyAccess, checkPermission("hasShelveDataAddPermission"), addShelvesProductStock);
router.put("/update-product/:id", verifyAccess, checkPermission("hasShelveDataChangePermission"), updateShelvesProductStock);
router.delete("/delete-product", verifyAccess, checkPermission("hasShelveDataDeletePermission"), deleteShelvesProductStock);

export default router;
