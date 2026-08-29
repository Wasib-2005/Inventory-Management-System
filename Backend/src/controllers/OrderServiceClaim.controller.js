import { logger } from "../config/logger.js";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Guarantee from "../models/ReturnsWarranty/Guarantee.model.js";
import Return from "../models/ReturnsWarranty/Returns.model.js";
import Warranty from "../models/ReturnsWarranty/Warranty.model.js";

const returnWindowDay = process.env.RETURN_WINDOW_DAYS !== undefined 
  ? Number(process.env.RETURN_WINDOW_DAYS) 
  : -1;

logger.info(`RETURN WINDOW DAYS: ${returnWindowDay} days import successful`);

export const createOrderServiceClaim = async (req, res) => {
  try {
    const { order, product, type, resolution, reason, notes } = req.body;
    const qty = Number(req.body.qty); // Prevent string concatenation

    if (!order || !product || !type || !qty) {
      return res.status(400).json({
        message: "Missing required data: order, product, type, and qty are required.",
      });
    }

    if (type === "return") {
      if (returnWindowDay < 0) {
        return res.status(403).json({ message: "Returns are not allowed for this store." });
      } 
    }

    const [productData, orderData] = await Promise.all([
      Product.findById(product).lean(), // use lean() for faster read
      Order.findById(order).lean()
    ]);

    if (!productData || !orderData) {
      return res.status(404).json({ message: "Order or Product not found." });
    }

    // Use lean() since we only need plain JS objects for counting
    const [warranties, guarantees, returns] = await Promise.all([
      Warranty.find({ order, product }).lean(),
      Guarantee.find({ order, product }).lean(),
      Return.find({ order, product }).lean(),
    ]);

    // --- Date Verification ---
    const todayDate = new Date();
    const serviceClaimDate = new Date(orderData.createdAt);

   let daysToAdd = 0;

    if (type === "return") {
      if (returnWindowDay < 0) {
        return res.status(403).json({ message: "Returns are not allowed for this store." });
      }
      daysToAdd = returnWindowDay;
    } 
    else if (type === "warranty") {
      if (!productData.warranty) {
        return res.status(403).json({ message: "This product has no warranty." });
      }
      daysToAdd = productData.warranty;
    } 
    else if (type === "guarantee") {
      if (!productData.guarantee) {
        return res.status(403).json({ message: "This product has no guarantee." });
      }
      daysToAdd = productData.guarantee;
    }
    serviceClaimDate.setDate(serviceClaimDate.getDate() + (Number(daysToAdd) || 0));

    if (todayDate > serviceClaimDate) {
      return res.status(403).json({ message: "Service Claim Date Expired!!!" });
    }

    // --- Qty Verification ---
    const allClaims = [...warranties, ...guarantees, ...returns];
    const serviceQty = allClaims.reduce((acc, curr) => {
      if (
        curr?.claimed === false || 
        curr?.resolution === "Refund" || 
        curr?.resolution === "Store Credit"
      ) {
        return acc + (curr?.qty || 0);
      }
      return acc;
    }, 0);

    let aggregatedResult = null;
    if (allClaims.length > 0) {
      const latestClaim = allClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      aggregatedResult = { ...latestClaim, qty: serviceQty };
    }

    logger.info({ serviceQty, aggregatedResult }, `Calculated claim quantities for order ${order}`);

    const orderItem = orderData.items?.find(item => item?.product.toString() === product);
    const orderQty = orderItem?.qty || 0;

    if (orderQty < serviceQty) {
      return res.status(403).json({ message: "No product left in order to claim." });
    }

    if (serviceQty + qty > orderQty) {
      return res.status(403).json({ message: "Requested claim quantity exceeds available products." });
    }

    // --- Create Claim ---
    let createdClaim;
    const claimPayload = { order, product, qty, resolution, notes, claimed: false };

    if (type === "warranty") {
      createdClaim = await Warranty.create(claimPayload);
    } else if (type === "return") {
      createdClaim = await Return.create({ ...claimPayload, reason });
    } else if (type === "guarantee") {
      createdClaim = await Guarantee.create(claimPayload);
    } else {
      return res.status(400).json({ message: "Invalid claim type provided." });
    }

    logger.info(`Successfully created ${type} claim for order ${order}`);

    return res.status(201).json({ 
      message: `${type} claim submitted successfully.`,
      data: createdClaim
    });

  } catch (error) {
    logger.error(error, "Error creating order service claim");
    return res.status(500).json({ message: "Internal server error" });
  }
};