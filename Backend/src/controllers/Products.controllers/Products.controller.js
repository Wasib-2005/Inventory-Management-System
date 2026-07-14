import logger from "../../config/logger.js";
import Category from "../../models/Category.model.js";
import Product from "../../models/Product.model.js";
import Supplier from "../../models/supplier.model.js";
import { generateImageName } from "../../utility/image/imageNameGenetator.js";
import { uploadImages } from "../../utility/image/uploadImages.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const verifyProductData = (data) => {
  const { displayId, sku, name, extraDetails, categoryData } = data;

  if (!displayId || !sku || !name || !categoryData) {
    return "Missing required root fields: displayId, sku, and name are mandatory.";
  }

  // if (extraDetails && Array.isArray(extraDetails)) {
  //   for (const section of extraDetails) {
  //     if (!section.header || !Array.isArray(section.body)) {
  //       return "Invalid extraDetails structure. Every section requires a 'header' and a 'body' array.";
  //     }

  //     for (const row of section.body) {
  //       if (!row.label || !row.value) {
  //         return "Invalid extraDetails body row. Every item requires a 'label' and a 'value'.";
  //       }
  //     }
  //   }
  // }

  return null;
};

export const createProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.data);
    logger.info(
      `${req.username} trying to create a product name: ${productData.name}`,
    );

    if (!productData.image) {
      productData.image = { header: "", extra: [] };
    }

    if (req?.files) {
      const files = req?.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        const getImgUrl = await uploadImages(element, "products");

        if (element.fieldname === "headerImage") {
          productData.image.header = getImgUrl[0];
        }

        if (element.fieldname.startsWith("extraImage_")) {
          const slotIndex = parseInt(element.fieldname.split("_")[1], 10);

          productData.image.extra[slotIndex] = getImgUrl[0];
        }
      }
    }

    const validationError = verifyProductData(productData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.userId;

    productData.createdBy = userId;
    productData.updatedBy = userId;

    const categoryId = productData?.categoryData?._id;

    const supplierIds =
      productData?.supplierData?.map((supplier) => supplier._id) || [];

    const parentId = productData?.parentProductId;

    const validationPromises = [];

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category data is broken",
      });
    }
    validationPromises.push(
      Category.exists({ _id: categoryId }).then((exists) => ({
        type: "category",
        exists,
      })),
    );

    if (parentId) {
      validationPromises.push(
        Product.exists({ _id: parentId }).then((exists) => ({
          type: "parentProduct",
          exists,
        })),
      );
    }

    if (supplierIds.length > 0) {
      validationPromises.push(
        Supplier.find({ _id: { $in: supplierIds } }, { _id: 1 }).then(
          (foundSuppliers) => {
            const allExist = foundSuppliers.length === supplierIds.length;
            return { type: "suppliers", exists: allExist };
          },
        ),
      );
    }

    const validationResults = await Promise.all(validationPromises);

    for (const result of validationResults) {
      if (!result.exists) {
        return res.status(400).json({
          success: false,
          message: `Database Validation Error: One or more IDs in '${result.type}' do not exist.`,
        });
      }
    }

    if (!productData.categoryData) {
      return res.status(400).json({
        success: false,
        message: "Category data is broken",
      });
    }
    productData.categoryData.category = productData.categoryData._id;

    delete productData.categoryData._id;

    productData.supplierData = supplierIds;

    const addProductToDB = await Product.create(productData);

    logger.info(
      `${req.username} (${userId}) created product: ${addProductToDB.name} (SKU: ${addProductToDB.sku})`,
    );

    return res.status(201).json({
      success: true,
      message: "Product verified and ready for database entry.",
      data: addProductToDB,
    });
  } catch (error) {
    logger.error(error.message || error);
    return res.status(500).json({
      success: false,
      message: "Server Error during product creation.",
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  const params = req.params;
};
