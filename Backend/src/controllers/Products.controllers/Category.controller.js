import { logger } from "../../config/logger.js";
import Category from "../../models/Category.model.js";

export const getCategory = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        category: { $regex: search, $options: "i" },
      };
    }

    const categories = await Category.find(query);

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  const categoryData = req.body;
  const userId = req.userId;

  logger.info(
    `Category creation initiated by User [${userId}]. Payload: ${JSON.stringify(categoryData)}`,
  );

  if (!categoryData || !categoryData.category) {
    logger.warn(
      `Category creation failed: Missing required fields. User [${userId}]`,
    );
    return res.status(400).json({
      success: false,
      message: "Category name is required.",
    });
  }

  categoryData.createdBy = userId;

  try {
    const existingCategory = await Category.findOne({
      category: categoryData.category,
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "This category already exists.",
      });
    }

    const newCategory = new Category(categoryData);

    const savedCategory = await newCategory.save();

    logger.info(
      `Category "${categoryData.category}" processed successfully for User [${userId}]`,
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    logger.error(
      `Error creating category for User [${userId}]: ${error.message}`,
      { error },
    );
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.userId;

  logger.info(
    `Category update initiated by User [${userId}] for Category ID [${id}]. Payload: ${JSON.stringify(updateData)}`,
  );

  if (!updateData || !updateData.category) {
    logger.warn(
      `Category update failed: Missing required fields. User [${userId}] for Category ID [${id}]`,
    );
    return res.status(400).json({
      success: false,
      message: "Category name is required.",
    });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: userId },
      { new: true },
    );

    if (!updatedCategory) {
      logger.warn(
        `Category update failed: Category not found. User [${userId}] for Category ID [${id}]`,
      );
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    logger.info(
      `Category "${updateData.category}" updated successfully for User [${userId}] and Category ID [${id}]`,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    logger.error(
      `Error updating category for User [${userId}] and Category ID [${id}]: ${error.message}`,
      { error },
    );
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    `Category deletion initiated by User [${userId}] for Category ID [${id}]`,
  );
  try {
    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true, deleteBy: userId },
      { new: true },
    );
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const restoreCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    `Category restoration initiated by User [${userId}] for Category ID [${id}]`,
  );

  try {
    const restoredCategory = await Category.findByIdAndUpdate(
      id,
      { isDeleted: false, updatedBy: userId, deleteBy: null },
      { new: true },
    );
    if (!restoredCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category restored successfully",
      data: restoredCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
