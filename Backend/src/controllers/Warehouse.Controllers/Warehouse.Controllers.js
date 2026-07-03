import logger from "../../config/logger.js";
import User from "../../models/user.model.js";
import { Warehouse } from "../../models/Warehouse.models/warehouseId.models.js";

export const createWarehouse = async (req, res) => {
  try {
    const {
      warehouseName,
      id: warehouseId,
      place,
      address,
      rackRows,
      racksPerRow,
    } = req.body;
    logger.info(
      `Trying to create warehouse with ID: ${warehouseId}, Name: ${warehouseName}, Place: ${place}, Address: ${address}, Rack Rows: ${rackRows}, Racks Per Row: ${racksPerRow} by User ID: ${req.userId}`,
    );
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

    logger.info(
      `Warehouse created successfully. ID: ${newWarehouse.warehouseId}, Name: ${newWarehouse.warehouseName}, Place: ${newWarehouse.place} by User: ${UserData.username}`,
    );

    // 5. FIX: Added success response so the frontend knows it succeeded
    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      data: newWarehouse,
    });
  } catch (error) {
    logger.error("Error occurred while creating warehouse:");
    console.error("errpr dazsda", error);
    logger.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    return res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    logger.error("Error occurred while fetching warehouses:");
    logger.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
