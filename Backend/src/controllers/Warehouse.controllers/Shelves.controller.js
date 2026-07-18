import { logger } from "../../config/logger.js";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";
import mongoose from "mongoose";

export const updateShelvesProductStock = async (req, res) => {
  const { id } = req.params;
  const { productId, inStock, maxStock, warningStock } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { _id: id, productId, userId, username },
    "Attempting to update Shelve product stock",
  );

  if (!id) {
    return res
      .status(400)
      .json({ message: "Shelve ID is required in URL parameters." });
  }

  if (!productId) {
    return res
      .status(400)
      .json({ message: "productId is required in the request body." });
  }

  try {
    const updatePayload = {};

    if (inStock !== undefined) {
      updatePayload["productData.$.stock.inStock"] = inStock;
    }
    if (maxStock !== undefined) {
      updatePayload["productData.$.stock.maxStock"] = maxStock;
    }
    if (warningStock !== undefined) {
      updatePayload["productData.$.stock.warningStock"] = warningStock;
    }

    updatePayload["productData.$.updatedBy"] = userId;

    const targetProductId = new mongoose.Types.ObjectId(productId);

    const updatedShelve = await Shelve.findOneAndUpdate(
      {
        _id: id,
        "productData.productInfo": targetProductId,
      },
      { $set: updatePayload },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    console.log(updatedShelve);

    if (!updatedShelve) {
      logger.warn(
        { _id: id, productId },
        "Update aborted: Shelve or specific product not found",
      );
      return res
        .status(404)
        .json({ message: "Shelve or matching product not found." });
    }

    logger.info(
      { _id: updatedShelve._id, updatedBy: userId, username },
      "Shelve product stock updated successfully",
    );

    return res.status(200).json({
      success: true,
      message: "Shelve product stock updated successfully.",
      data: updatedShelve,
    });
  } catch (error) {
    logger.error(
      { err: error, _id: id, productId },
      "Error occurred while updating Shelve product stock",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
