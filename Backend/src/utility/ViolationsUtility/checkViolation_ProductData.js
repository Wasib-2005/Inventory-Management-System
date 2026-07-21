import mongoose from "mongoose";
import Product from "../../models/Product.model.js";
import { saveViolation } from "./saveViolation.js";
import { logger } from "../../config/logger.js";

export const checkViolation_ProductData = async (
  items,
  warehouseId,
  subtotal,
  total,
  userId,
  ipAddress = "",
) => {
  const productIds = items.map((item) => item.productInfo);
  const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();

  let totalBuyPrice = 0;
  let totalSellPrice = 0;
  let totalMRP = 0;

  const violationsList = [];

  const baseWhere = [
    userId
      ? { id: new mongoose.Types.ObjectId(userId), entityType: "User" }
      : null,
    warehouseId
      ? {
          id: new mongoose.Types.ObjectId(warehouseId),
          entityType: "Warehouse",
        }
      : null,
  ].filter(Boolean);

  for (const item of items) {
    const dbProduct = dbProducts.find(
      (p) => p._id.toString() === item.productInfo.toString(),
    );

    if (!dbProduct) continue;

    const qty = item.qty;
    const submittedPrice = item.price;
    const dbBuyPrice = dbProduct.pricing.buyPrice;
    const dbSellPrice = dbProduct.pricing.sellPrice;
    const dbMrp = dbProduct.pricing.mrp;

    totalBuyPrice += dbBuyPrice * qty;
    totalSellPrice += dbSellPrice * qty;
    totalMRP += dbMrp * qty;

    // Rule: Item price != MRP (Level 1)
    if (submittedPrice !== dbMrp) {
      violationsList.push({
        level: 1,

        where: [
          ...baseWhere,
          {
            id: new mongoose.Types.ObjectId(dbProduct._id),
            entityType: "Product",
          },
        ],
        what: {
          type: "ITEM_PRICE_MISMATCH",
          description: `Product '${dbProduct.name}' submitted price (${submittedPrice}) does not match MRP (${dbMrp}).`,
          metadata: {
            productId: dbProduct._id,
            submittedPrice,
            expectedMrp: dbMrp,
          },
        },
      });
    }
  }

  const allProductsWhere = [
    ...baseWhere,
    ...dbProducts.map((p) => ({
      id: new mongoose.Types.ObjectId(p._id),
      entityType: "Product",
    })),
  ];

  if (totalMRP !== subtotal) {
    violationsList.push({
      level: 1,
      where: allProductsWhere,
      what: {
        type: "SUBTOTAL_MISMATCH",
        description: `Sum of products MRP (${totalMRP}) does not match submitted subtotal (${subtotal}).`,
        metadata: { calculatedMrpTotal: totalMRP, submittedSubtotal: subtotal },
      },
    });
  }

  if (totalBuyPrice > total) {
    violationsList.push({
      level: 1,
      where: allProductsWhere,
      what: {
        type: "SELLING_BELOW_COST",
        description: `Total cost/buy price (${totalBuyPrice}) is greater than the final total paid (${total}).`,
        metadata: { totalBuyPrice, finalTotal: total },
      },
    });
  } else if (totalSellPrice > total) {
    violationsList.push({
      level: 3,
      where: allProductsWhere,
      what: {
        type: "SELLING_BELOW_MARGIN",
        description: `Target sell price (${totalSellPrice}) is greater than the final total paid (${total}).`,
        metadata: { totalSellPrice, finalTotal: total },
      },
    });
  }

  const formattedViolations = violationsList.map((v) => ({
    where: v.where,
    what: v.what,
    byWho: {
      user: userId ? new mongoose.Types.ObjectId(userId) : null,
      role: "USER",
      ipAddress: ipAddress,
    },
    violationLevel: v.level,
  }));

  if (formattedViolations.length > 0) {
    logger.warn(
      {
        userId,
        count: formattedViolations.length,
        violations: formattedViolations,
      },
      "Order compliance violations detected",
    );

    await saveViolation(formattedViolations);
  }

  const isBlocked = formattedViolations.some(
    (v) => v.violationLevel === 1 || v.violationLevel === 2,
  );
  const warnings = formattedViolations.filter((v) => v.violationLevel === 3);

  return { isBlocked, violations: formattedViolations, warnings };
};
