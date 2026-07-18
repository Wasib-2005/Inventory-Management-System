import mongoose from "mongoose";
import { logger } from "../../config/logger.js";
import { Warehouse } from "../../models/Warehouse.models/warehouse.models.js";
import { Rack } from "../../models/Warehouse.models/Rack.models.js";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";
import User from "../../models/user.model.js";

export const createWarehouse = async (req, res) => {
  const { warehouseName, warehouseId, place, address,  } =
    req.body;

  logger.info(
    { warehouseId, warehouseName, place, address, userId: req.userId, },
    "Attempting to create warehouse",
  );

  if (!warehouseName || !warehouseId || !place || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const warehouseExists = await Warehouse.findOne({ warehouseId });
    if (warehouseExists) {
      logger.warn(
        { warehouseId },
        "Creation aborted: Warehouse custom ID already exists",
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
      { _id: newWarehouse._id, createdBy: req.username },
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
    return res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    logger.error({ err: error }, "Error occurred while fetching warehouses");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWarehouseById = async (req, res) => {
  const { id } = req.params;

  logger.info({ _id: id }, "Fetching warehouse details");

  try {
    const warehouseData = await Warehouse.findById(id)
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
      logger.warn({ _id: id }, "Warehouse lookup failed: Not Found or Deleted");
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    logger.info({ _id: id }, "Warehouse details successfully retrieved");
    return res.status(200).json({
      success: true,
      data: warehouseData,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: req.params.id },
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
  const { id } = req.params;
  const { warehouseName, place, address, disabled } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, userId, username },
    "Attempting to update warehouse basic details",
  );

  if (!id) {
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
      { _id: id },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!updatedWarehouse) {
      logger.warn({ _id: id }, "Warehouse not found for update");
      return res.status(404).json({ message: "Warehouse not found." });
    }

    logger.info(
      { _id: updatedWarehouse._id, updatedBy: userId },
      "Warehouse updated successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully.",
      data: updatedWarehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while updating warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWarehouse = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    { _id: id, deletedBy: userId },
    "Attempting soft-delete of warehouse",
  );

  if (!id) {
    return res.status(400).json({ message: "Warehouse ID is required." });
  }

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      logger.warn(
        { _id: id },
        "Soft-delete aborted: Warehouse not found or already deleted",
      );
      return res.status(404).json({ message: "Warehouse not found." });
    }

    warehouse.isDeleted = true;
    warehouse.deleteBy = userId;

    await warehouse.save();

    logger.info(
      { _id: warehouse._id, deletedBy: userId },
      "Warehouse soft-deleted successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully.",
      data: warehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while soft-deleting warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreWarehouse = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    { _id: id, restoredBy: userId },
    "Attempting to restore soft-deleted warehouse",
  );

  if (!id) {
    return res.status(400).json({ message: "Warehouse ID is required." });
  }

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      logger.warn(
        { _id: id },
        "Restore aborted: Warehouse not found or is not deleted",
      );
      return res.status(404).json({ message: "Deleted warehouse not found." });
    }

    warehouse.isDeleted = false;
    warehouse.updatedBy = req.userId;

    await warehouse.save();

    logger.info(
      { _id: warehouse._id, restoredBy: userId },
      "Warehouse successfully restored",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse restored successfully.",
      data: warehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while restoring warehouse",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const disabledEnabledWarehouse = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.userId;

  logger.info(
    { _id: id, status, updatedBy: userId },
    "Attempting to update warehouse disabled/enabled status",
  );

  if (!id) {
    return res.status(400).json({ message: "Warehouse ID is required." });
  }

  if (typeof status !== "boolean") {
    return res
      .status(400)
      .json({ message: "Status must be a boolean value (true/false)." });
  }

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      logger.warn({ _id: id }, "Status update aborted: Warehouse not found");
      return res.status(404).json({ message: "Warehouse not found." });
    }

    warehouse.disabled = status;
    warehouse.updatedBy = userId;

    await warehouse.save();

    logger.info(
      { _id: warehouse._id, disabled: warehouse.disabled, updatedBy: userId },
      `Warehouse successfully ${status ? "disabled" : "enabled"}`,
    );

    return res.status(200).json({
      success: true,
      message: `Warehouse ${status ? "disabled" : "enabled"} successfully.`,
      data: warehouse,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while shifting warehouse status",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
