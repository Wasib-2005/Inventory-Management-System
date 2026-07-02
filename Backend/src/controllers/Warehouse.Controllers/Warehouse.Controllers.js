import logger from "../../config/logger.js";
import User from "../../models/user.model.js";
import { Warehouse } from "../../models/Warehouse.models/warehouseId.models.js";

export const createWarehouse = async (req, res) => {
  try {
    const { warehouseName, warehouseId, place, address, rackRows, racksPerRow } =
      req.body;

    // 1. Validation
    if (
      !warehouseName ||
      !warehouseId ||
      !place ||
      !address ||
      !rackRows ||
      !racksPerRow
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2. Fetch User & Log
    const UserData = await User.findById(req.userId);
    if (!UserData) {
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    logger.info(
      `User ${UserData.username} is attempting to create a warehouse. Place: ${place}, Address: ${address}, Warehouse ID: ${warehouseId}, Rack Rows: ${rackRows}, Racks Per Row: ${racksPerRow}`,
    );

    // 3. Check Duplicates
    const warehouseExists = await Warehouse.findOne({ warehouseId });
    if (warehouseExists) {
      return res.status(400).json({ message: "Warehouse ID already exists." });
    }

    const warehouseData = {
      warehouseName,
      warehouseId,
      place,
      address,
      rackRows,
      racksPerRow,
      createdBy: req.userId,
    };

    // 4. FIX: Added 'await' so it actually waits for MongoDB to save the document
    const newWarehouse = await Warehouse.create(warehouseData);

    // 5. FIX: Added success response so the frontend knows it succeeded
    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      data: newWarehouse,
    });
  } catch (error) {
    logger.error("Error occurred while creating warehouse:");
    console.error("errpr dazsda",error);
    logger.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
