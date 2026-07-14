import {logger} from "../../config/logger.js";
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
