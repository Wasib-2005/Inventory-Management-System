import { logger } from "../../config/logger.js";
import Category from "../../models/Category.model.js";
import Product from "../../models/Product.model.js";
import Supplier from "../../models/supplier.model.js";
import { generateImageName } from "../../utility/image/imageNameGenetator.js";
import { replaceImages } from "../../utility/image/replaceImages.js";
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

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    logger.info(
      { search, status, category, subcategory, brand, page, limit },
      "Fetching products with query filters",
    );
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (status) {
      filter.status = status;
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }
    if (category) {
      filter["categoryData.category"] = category;
    }
    if (subcategory) {
      filter["categoryData.subcategory"] = subcategory;
    }

    if (minPrice || maxPrice) {
      filter["pricing.sellPrice"] = {};
      if (minPrice) filter["pricing.sellPrice"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.sellPrice"].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate("categoryData.category", "category")
        .populate("supplierData")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
      data: products,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching products.",
      error: error.message,
    });
  }
};

export const getProductsId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(
        { productId: id },
        "Attempted to fetch product with invalid ID format",
      );
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    const product = await Product.findById(id)
      .populate("categoryData.category", "category")
      .populate("supplierData")
      .lean();

    if (!product) {
      logger.warn({ productId: id }, "Product not found in database");
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    logger.info({ productId: id }, "Product successfully retrieved");

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(
      { err: error, productId: req.params.id },
      "Error in getProductsId controller",
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product.",
      error: error.message,
    });
  }
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

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format.",
      });
    }

    const productDataReq = JSON.parse(req.body.data);

    const validationError = verifyProductData(productDataReq);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    logger.info(
      `${req.username} is trying to update product: ${existingProduct.name} (ID: ${productId})`,
    );

    if (!productDataReq.image) {
      productDataReq.image = {
        header: existingProduct.image?.header || "",
        extra: existingProduct.image?.extra || [],
      };
    } else {
      productDataReq.image.header =
        productDataReq.image.header || existingProduct.image?.header || "";
      productDataReq.image.extra =
        productDataReq.image.extra || existingProduct.image?.extra || [];
    }

    if (req?.files && req.files.length > 0) {
      const files = req.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];

        if (element.fieldname === "headerImage") {
          const newHeaderUrl = await replaceImages(
            existingProduct.image?.header,
            element,
            "products",
          );
          productDataReq.image.header = newHeaderUrl;
        }

        if (element.fieldname.startsWith("extraImage_")) {
          const slotIndex = parseInt(element.fieldname.split("_")[1], 10);
          const oldExtraUrl = existingProduct.image?.extra?.[slotIndex] || null;

          const newExtraUrl = await replaceImages(
            oldExtraUrl,
            element,
            "products",
          );
          productDataReq.image.extra[slotIndex] = newExtraUrl;
        }
      }
    }

    const categoryId = productDataReq?.categoryData?._id;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category data is missing or broken.",
      });
    }

    const supplierIds =
      productDataReq?.supplierData?.map((supplier) =>
        typeof supplier === "object" ? supplier._id : supplier,
      ) || [];

    const parentId = productDataReq?.parentProductId;

    const validationPromises = [
      Category.exists({ _id: categoryId }).then((exists) => ({
        type: "category",
        exists,
      })),
    ];

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

    productDataReq.categoryData = {
      category: categoryId,
      subcategory: productDataReq.categoryData.subcategory || "",
    };

    productDataReq.supplierData = supplierIds;

    productDataReq.updatedBy = req.userId;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: productDataReq },
      { returnDocument: "after" },
    )
      .populate("categoryData.category", "category")
      .populate("supplierData");

    logger.info(
      `${req.username} successfully updated product ID: ${productId}`,
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    logger.error(error.message || error);
    return res.status(500).json({
      success: false,
      message: "Server Error during product update.",
      error: error.message,
    });
  }
};


