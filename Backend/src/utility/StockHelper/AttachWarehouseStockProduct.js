import mongoose from "mongoose";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";

/**
 * Calculates and attaches warehouse stock levels and layout configurations to product data.
 * Handles both a single product object or an array of product objects.
 *
 * @param {Object|Array<Object>} productData - A single lean product object or an array of lean product objects
 * @param {string} warehouseId - The ID of the warehouse to check stock for
 * @returns {Promise<Object|Array<Object>>} The input data with attached .stock and .shelveData properties
 */
export const attachWarehouseStockProduct = async (productData, warehouseId) => {
  if (!warehouseId || !productData) {
    return productData;
  }

  const isArray = Array.isArray(productData);
  const productsList = isArray ? productData : [productData];

  if (productsList.length === 0) {
    return productData;
  }

  const productIds = productsList.map((p) => p._id);

  const stockData = await Shelve.aggregate([
    {
      $match: {
        warehouse_Id: new mongoose.Types.ObjectId(warehouseId),
        isDeleted: false,
      },
    },
    {
      $unwind: "$productData",
    },
    {
      $match: {
        "productData.isDeleted": false,
        "productData.productInfo": { $in: productIds },
      },
    },

    {
      $lookup: {
        from: "racks",
        localField: "rackData",
        foreignField: "_id",
        as: "rackDetails",
      },
    },

    {
      $unwind: {
        path: "$rackDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$productData.productInfo",
        totalStock: { $sum: "$productData.stock.inStock" },
        shelveData: {
          $push: {
            rackData: "$rackDetails",
            shelfCode: "$shelfCode",
            shelfId: "$_id",
            stock: "$productData.stock",
          },
        },
      },
    },
  ]);

  const stockMap = stockData.reduce((acc, curr) => {
    acc[curr._id.toString()] = {
      totalStock: curr.totalStock,
      shelveData: curr.shelveData,
    };
    return acc;
  }, {});

  productsList.forEach((product) => {
    const matchedData = stockMap[product._id.toString()];

    product.stock = matchedData ? matchedData.totalStock : 0;
    product.shelveData = matchedData ? matchedData.shelveData : [];
  });

  return isArray ? productsList : productsList[0];
};
