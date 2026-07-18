import mongoose from "mongoose";
import { logger } from "../../config/logger.js";
import { Rack } from "../../models/Warehouse.models/Rack.models.js";
import { Warehouse } from "../../models/Warehouse.models/warehouse.models.js";

export const createRack = async (req, res) => {
  const { warehouseId, rackCode, column, group } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { rackCode, column, userId, username },
    "Attempting to create rack",
  );

  if (!rackCode || !column || !warehouseId) {
    return res
      .status(400)
      .json({ message: "Rack Code and Column are required." });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingRack = await Rack.findOne({ rackCode }).session(session);
    if (existingRack) {
      logger.warn(
        { rackCode },
        "Creation aborted: Rack code already exists in active racks",
      );
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Rack code already exists." });
    }

    const [newRack] = await Rack.create(
      [{ rackCode, column, group, createdBy: userId }],
      { session },
    );

    const warehouse = await Warehouse.findById(warehouseId).session(session);
    if (!warehouse) {
      logger.warn({ warehouseId }, "Warehouse not found");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Warehouse not found." });
    }

    warehouse.rackdata.push(newRack._id);

    await warehouse.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info({ _id: newRack._id, rackCode }, "Rack created successfully");

    return res.status(201).json({
      success: true,
      message: "Rack created successfully.",
      data: newRack,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(
      { err: error },
      "Error occurred while creating rack. Transaction rolled back.",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRack = async (req, res) => {
  const { id } = req.params;
  const { rackCode, column, group } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info({ _id: id, userId, username }, "Attempting to update rack");

  if (!id) {
    return res
      .status(400)
      .json({ message: "Rack ID is required in URL parameters." });
  }

  try {
    const updatePayload = {};
    if (rackCode !== undefined) updatePayload.rackCode = rackCode;
    if (column !== undefined) updatePayload.column = column;
    if (group !== undefined) updatePayload.group = group;

    const updatedRack = await Rack.findOneAndUpdate(
      { _id: id },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!updatedRack) {
      logger.warn({ _id: id }, "Update aborted: Rack not found or is deleted");
      return res.status(404).json({ message: "Rack not found." });
    }

    logger.info(
      { _id: updatedRack._id, updatedBy: userId, username },
      "Rack updated successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Rack updated successfully.",
      data: updatedRack,
    });
  } catch (error) {
    logger.error({ err: error, _id: id }, "Error occurred while updating rack");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRack = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, deletedBy: userId, username },
    "Attempting soft-delete of rack",
  );

  if (!id) {
    return res.status(400).json({ message: "Rack ID is required." });
  }

  try {
    const rack = await Rack.findById(id);

    if (!rack) {
      logger.warn(
        { _id: id },
        "Soft-delete aborted: Rack not found or already deleted",
      );
      return res.status(404).json({ message: "Rack not found." });
    }

    rack.isDeleted = true;
    rack.deleteBy = userId;

    await rack.save();

    logger.info(
      { _id: rack._id, deletedBy: userId },
      "Rack soft-deleted successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Rack deleted successfully.",
      data: rack,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while soft-deleting rack",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreRack = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, restoredBy: userId, username },
    "Attempting to restore soft-deleted rack",
  );

  if (!id) {
    return res.status(400).json({ message: "Rack ID is required." });
  }

  try {
    const rack = await Rack.findById(id);

    console.log(rack);

    if (!rack) {
      logger.warn(
        { _id: id },
        "Restore aborted: Rack not found or is not deleted",
      );
      return res.status(404).json({ message: "Deleted rack not found." });
    }

    rack.isDeleted = false;
    rack.deleteBy = undefined;

    await rack.save();

    logger.info(
      { _id: rack._id, restoredBy: userId },
      "Rack successfully restored",
    );

    return res.status(200).json({
      success: true,
      message: "Rack restored successfully.",
      data: rack,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while restoring rack",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
