import { logger } from "../../../config/logger.js";
import { Shelve } from "../../../models/Warehouse.models/shelve.models.js";
import mongoose from "mongoose";

export const addShelvesProductStock = async (req, res) => {
  const { shelfId, productId, inStock, maxStock, warningStock } = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { shelfId, productId, userId, username },
    "Attempting to add product to Shelve inventory",
  );

  if (!shelfId || !productId) {
    return res
      .status(400)
      .json({ message: "Both shelfId and productId are required in the request body." });
  }

  try {
    // 1. Fetch the targeted Shelf document
    const shelveDoc = await Shelve.findById(shelfId);

    if (!shelveDoc) {
      logger.warn({ shelfId }, "Add product aborted: Shelf document not found");
      return res.status(404).json({ message: "Shelf document not found." });
    }

    // 2. Check if this product is already on the shelf to prevent duplicates
    const productExists = shelveDoc.productData.some(
      (item) => item.productInfo?.toString() === productId.toString()
    );

    if (productExists) {
      return res.status(400).json({ 
        message: "This product already exists on the shelf. Use the update route instead." 
      });
    }

    // 3. Fallback math rules for incoming parameters
    const finalInStock = inStock ?? 0;
    let finalMaxStock = maxStock ?? 0;

    if (finalMaxStock <= finalInStock) {
      finalMaxStock = finalInStock;
    }

    // Automatically calculate 20% if warningStock isn't sent explicitly
    const finalWarningStock = warningStock !== undefined 
      ? warningStock 
      : (finalMaxStock * 20) / 100;

    // 4. Formulate and push the subdocument
    const newProductStock = {
      productInfo: productId,
      stock: {
        inStock: finalInStock,
        maxStock: finalMaxStock,
        warningStock: finalWarningStock,
      },
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
    };

    shelveDoc.productData.push(newProductStock);

    // 5. Save the document to DB (This triggers validation rules)
    await shelveDoc.save();

    logger.info(
      { _id: shelfId, productId, addedBy: username },
      "Product added successfully to shelf inventory",
    );

    return res.status(201).json({
      success: true,
      message: "Product added to shelf successfully.",
      data: shelveDoc,
    });
  } catch (error) {
    logger.error(
      { err: error, shelfId, productId },
      "Error occurred while adding product to Shelve inventory",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
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

export const deleteShelvesProductStock = async (req, res) => {
  const { shelvesId, productId } = req.query;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    { shelvesId, productId, userId, username },
    "Attempting to remove product from Shelve array",
  );

  if (!shelvesId || !productId) {
    return res.status(400).json({
      message: "Both shelvesId and productId are required in query parameters.",
    });
  }

  try {
    const updatedShelve = await Shelve.findByIdAndUpdate(
      shelvesId,
      {
        $pull: {
          productData: {
            productInfo: productId,
          },
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!updatedShelve) {
      logger.warn({ shelvesId }, "Delete aborted: Shelve document not found");
      return res.status(404).json({ message: "Shelve document not found." });
    }

    logger.info(
      { _id: shelvesId, productId, deletedBy: username },
      "Product successfully removed from Shelve array",
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from shelf successfully.",
      data: updatedShelve,
    });
  } catch (error) {
    logger.error(
      { err: error, shelvesId, productId },
      "Error occurred while deleting product from Shelve",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
