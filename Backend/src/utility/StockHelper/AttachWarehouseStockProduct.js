import mongoose from "mongoose";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";

/**
 * Calculates and attaches warehouse stock levels to product data.
 * Handles both a single product object or an array of product objects.
 *
 * @param {Object|Array<Object>} productData - A single lean product object or an array of lean product objects
 * @param {string} warehouseId - The ID of the warehouse to check stock for
 * @returns {Promise<Object|Array<Object>>} The input data with the attached .stock property
 */
export const attachWarehouseStockProduct = async (productData, warehouseId) => {
  // 1. Quick exit if required arguments are missing
  if (!warehouseId || !productData) {
    return productData;
  }

  // 2. Normalize input: determine if it's an array or a single object
  const isArray = Array.isArray(productData);
  const productsList = isArray ? productData : [productData];

  if (productsList.length === 0) {
    return productData;
  }

  // 3. Gather unique Product ObjectIds from the array
  const productIds = productsList.map((p) => p._id);

  // 4. Run the stock aggregation against the Shelve collection
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
      $group: {
        _id: "$productData.productInfo",
        totalStock: { $sum: "$productData.stock.inStock" },
      },
    },
  ]);

  // 5. Build a fast O(1) key-value lookup map: { "productId": totalStock }
  const stockMap = stockData.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.totalStock;
    return acc;
  }, {});

  // 6. Inject the stock value into our list of items
  productsList.forEach((product) => {
    product.stock = stockMap[product._id.toString()] || 0;
  });

  // 7. Return back in the exact format it was received
  return isArray ? productsList : productsList[0];
};
