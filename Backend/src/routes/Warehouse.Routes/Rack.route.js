import express from "express";
import {
  createRack,
  deleteRack,
  restoreRack,
  updateRack,
} from "../../controllers/Warehouse.controllers/Rack.controller.js";
import { verifyAccess } from "../../middlewares/verifyAccess.middleware.js";

const router = express.Router();

router.post("/create", verifyAccess, createRack);
router.put("/update/:id", verifyAccess, updateRack);
router.delete("/delete/:id", verifyAccess, deleteRack);
router.patch("/restore/:id", verifyAccess, restoreRack);

export default router;
