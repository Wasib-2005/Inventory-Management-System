import mongoose from "mongoose";
import { logger } from "../../config/logger.js";
import { Warehouse } from "../../models/Warehouse.models/warehouse.models.js";
import { Rack } from "../../models/Warehouse.models/Rack.models.js";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";
import User from "../../models/user.model.js";

export const createWarehouse = async (req, res) => {
  const { warehouseName, warehouseId, place, address } = req.body;

  logger.info(
    { warehouseId, warehouseName, place, address, userId: req.userId },
    "Attempting to create warehouse",
  );

  if (!warehouseName || !warehouseId || !place || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const UserData = await User.findById(req.userId);
    if (!UserData) {
      logger.warn(
        { userId: req.userId },
        "Creation aborted: Authenticated user not found",
      );
      return res.status(404).json({ message: "Authenticated user not found." });
    }

    const warehouseExists = await Warehouse.findOne({ warehouseId });
    if (warehouseExists) {
      logger.warn(
        { warehouseId },
        "Creation aborted: Warehouse ID already exists",
      );
      return res.status(400).json({ message: "Warehouse ID already exists." });
    }

    const warehouseData = {
      warehouseName,
      warehouseId,
      place,
      address,
      createdBy: req.userId,
    };

    const newWarehouse = await Warehouse.create(warehouseData);

    logger.info(
      { warehouseId: newWarehouse.warehouseId, createdBy: UserData.username },
      "Warehouse created successfully",
    );

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      data: newWarehouse,
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.error(
        { warehouseId },
        "Duplicate warehouseId error caught on database save",
      );
      return res.status(400).json({ message: "Warehouse ID already exists." });
    }

    logger.error({ err: error }, "Error occurred while creating warehouse");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    // .populate("createdBy", "username email") // only send warehouse data
    // .populate({
    //   path: "rackdata",
    //   populate: {
    //     path: "shelfData",
    //     populate: {
    //       path: "productData.productInfo",
    //       select: "name pricing image brand sku displayId",
    //     },
    //   },
    // });
    return res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    logger.error({ err: error }, "Error occurred while fetching warehouses");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWarehouseById = async (req, res) => {
  logger.info(
    { warehouseId: req.params.warehouseId },
    "Fetching warehouse details",
  );

  try {
    const { warehouseId } = req.params;

    const warehouseData = await Warehouse.findById(warehouseId)
      .populate("createdBy", "username email")
      .populate({
        path: "rackdata",
        populate: {
          path: "shelfData",
          populate: {
            path: "productData.productInfo",
            select: "name pricing image brand sku displayId",
          },
        },
      });

    if (!warehouseData) {
      logger.warn(
        { warehouseId: warehouseId },
        "Warehouse lookup failed: Not Found",
      );
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    logger.info(
      { warehouseId: warehouseId },
      "Warehouse details successfully retrieved",
    );
    return res.status(200).json({
      success: true,
      data: warehouseData,
    });
  } catch (error) {
    logger.error(
      { err: error, warehouseId: req.params.warehouseId },
      "Error occurred while fetching warehouse",
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const { warehouseName, place, address, disabled } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { warehouseId, userId, username },
    "Attempting to update warehouse basic details",
  );

  if (!warehouseId) {
    return res
      .status(400)
      .json({ message: "Warehouse ID is required in URL parameters." });
  }

  try {
    const updatePayload = {};
    if (warehouseName !== undefined)
      updatePayload.warehouseName = warehouseName;
    if (place !== undefined) updatePayload.place = place;
    if (address !== undefined) updatePayload.address = address;
    if (disabled !== undefined) updatePayload.disabled = disabled;

    const updatedWarehouse = await Warehouse.findOneAndUpdate(
      { warehouseId },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!updatedWarehouse) {
      logger.warn({ warehouseId }, "Warehouse not found for update");
      return res.status(404).json({ message: "Warehouse not found." });
    }

    logger.info(
      { warehouseId: updatedWarehouse.warehouseId, updatedBy: userId },
      "Warehouse updated successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully.",
      data: updatedWarehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, warehouseId },
      "Error occurred while updating warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const userId = req.userId;

  logger.info(
    { warehouseId, deletedBy: userId },
    "Attempting soft-delete of warehouse",
  );

  if (!warehouseId) {
    return res.status(400).json({ message: "Warehouse ID is required." });
  }

  try {
    const warehouse = await Warehouse.findOne({
      warehouseId,
      isDeleted: false,
    });

    if (!warehouse) {
      logger.warn(
        { warehouseId },
        "Soft-delete aborted: Warehouse not found or already deleted",
      );
      return res.status(404).json({ message: "Warehouse not found." });
    }

    warehouse.isDeleted = true;
    warehouse.deleteBy = userId;

    await warehouse.save();

    logger.info(
      { warehouseId: warehouse.warehouseId, deletedBy: userId },
      "Warehouse soft-deleted successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully.",
      data: warehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, warehouseId },
      "Error occurred while soft-deleting warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const userId = req.userId;

  logger.info(
    { warehouseId, restoredBy: userId },
    "Attempting to restore soft-deleted warehouse",
  );

  if (!warehouseId) {
    return res.status(400).json({ message: "Warehouse ID is required." });
  }

  try {
    const warehouse = await Warehouse.findOne({ warehouseId, isDeleted: true });

    if (!warehouse) {
      logger.warn(
        { warehouseId },
        "Restore aborted: Warehouse not found or is not deleted",
      );
      return res.status(404).json({ message: "Deleted warehouse not found." });
    }

    warehouse.isDeleted = false;

    warehouse.deletedAt = undefined;
    warehouse.deleteBy = undefined;

    await warehouse.save();

    logger.info(
      { warehouseId: warehouse.warehouseId, restoredBy: userId },
      "Warehouse successfully restored",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse restored successfully.",
      data: warehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, warehouseId },
      "Error occurred while restoring warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
