import Category from "../../models/Category.model.js";

export const getCategory = async (req, res) => {
  try {
    const category = await Category.find();

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {};
