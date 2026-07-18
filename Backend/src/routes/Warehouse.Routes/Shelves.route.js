import express from "express";
import {
  addShelvesProductStock,
  deleteShelvesProductStock,
  updateShelvesProductStock,
} from "../../controllers/Warehouse.controllers/Shelves.controller/Shelves.product.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";
import {
    createShelves,
  deleteShelves,
  restoreShelves,
  updateShelves,
} from "../../controllers/Warehouse.controllers/Shelves.controller/Shelves.controller.js";

const router = express.Router();

//Shelves
router.post("/create", verifyAccess, createShelves);
router.put("/update/:id", verifyAccess, updateShelves);
router.delete("/delete/:id", verifyAccess, deleteShelves);
router.patch("/restore/:id", verifyAccess, restoreShelves);

// For product
router.post("/add-product", verifyAccess, addShelvesProductStock);
router.put("/update-product/:id", verifyAccess, updateShelvesProductStock);
router.delete("/delete-product", verifyAccess, deleteShelvesProductStock);

export default router;
