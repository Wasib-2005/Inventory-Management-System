import express from "express";
import { updateShelvesProductStock } from "../../controllers/Warehouse.controllers/Shelves.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.put("/update-product/:id", verifyAccess, updateShelvesProductStock);

export default router;
