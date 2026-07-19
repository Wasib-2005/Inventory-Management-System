import mongoose from "mongoose";
import { logger } from "../../../config/logger.js";
import { Shelve } from "../../../models/Warehouse.models/shelve.models.js";
import { Rack } from "../../../models/Warehouse.models/Rack.models.js";

export const createShelves = async (req, res) => {
  const { shelfCode, rackId, warehouse_Id } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { shelfCode, rackId, userId, username },
    "Attempting to create shelf",
  );

  if (!shelfCode || !rackId || !warehouse_Id) {
    return res
      .status(400)
      .json({ message: "Shelf Code, Rack ID and Warehouse Id are required." });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingShelve = await Shelve.findOne({ shelfCode }).session(session);
    if (existingShelve) {
      logger.warn({ shelfCode }, "Creation aborted: Shelf code already exists");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Shelf code already exists." });
    }

    const [newShelve] = await Shelve.create(
      [{ shelfCode, productData: [], createdBy: userId, warehouse_Id }],
      { session },
    );

    const rack = await Rack.findById(rackId).session(session);
    if (!rack) {
      logger.warn({ rackId }, "Rack not found during shelf placement");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Rack not found." });
    }

    rack.shelfData.push(newShelve._id);
    await rack.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info(
      { _id: newShelve._id, shelfCode },
      "Shelf created successfully",
    );

    return res.status(201).json({
      success: true,
      message: "Shelf created successfully.",
      data: newShelve,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(
      { err: error },
      "Error occurred while creating shelf. Transaction rolled back.",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateShelves = async (req, res) => {
  const { id } = req.params;
  const { shelfCode } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, userId, username },
    "Attempting to update shelf details",
  );

  if (!id) {
    return res
      .status(400)
      .json({ message: "Shelve ID is required in URL parameters." });
  }

  if (!shelfCode) {
    return res
      .status(400)
      .json({ message: "shelfCode is required in the request body." });
  }

  try {
    const updatedShelve = await Shelve.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          shelfCode,
          updatedBy: userId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedShelve) {
      logger.warn({ _id: id }, "Update aborted: Shelve not found");
      return res.status(404).json({ message: "Shelve not found." });
    }

    logger.info(
      { _id: updatedShelve._id, updatedBy: userId, username },
      "Shelve details updated successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Shelve updated successfully.",
      data: updatedShelve,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while updating shelve",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteShelves = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, deletedBy: userId, username },
    "Attempting soft-delete of shelve",
  );

  if (!id) {
    return res.status(400).json({ message: "Shelve ID is required." });
  }

  try {
    const shelve = await Shelve.findById(id);

    if (!shelve) {
      logger.warn(
        { _id: id },
        "Soft-delete aborted: Shelve not found or already deleted",
      );
      return res.status(404).json({ message: "Shelve not found." });
    }
    shelve.isDeleted = true;
    shelve.deleteBy = userId;

    await shelve.save();

    logger.info(
      { _id: shelve._id, deletedBy: userId },
      "Shelve soft-deleted successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Shelve deleted successfully.",
      data: shelve,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while soft-deleting shelve",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreShelves = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, restoredBy: userId, username },
    "Attempting to restore soft-deleted shelve",
  );

  if (!id) {
    return res.status(400).json({ message: "Shelve ID is required." });
  }

  try {
    const shelve = await Shelve.findById(id);

    if (!shelve) {
      logger.warn({ _id: id }, "Restore aborted: Shelve not found");
      return res.status(404).json({ message: "Shelve not found." });
    }

    shelve.isDeleted = false;
    shelve.deleteBy = undefined;
    shelve.updatedBy = userId;

    await shelve.save();

    logger.info(
      { _id: shelve._id, restoredBy: userId },
      "Shelve restored successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Shelve restored successfully.",
      data: shelve,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id },
      "Error occurred while restoring shelve",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
