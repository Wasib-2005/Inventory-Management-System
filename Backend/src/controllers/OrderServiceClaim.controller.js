import { connect } from "mongoose";
import { logger } from "../config/logger.js";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Guarantee from "../models/ReturnsWarranty/Guarantee.model.js";
import Return from "../models/ReturnsWarranty/Returns.model.js";
import Warranty from "../models/ReturnsWarranty/Warranty.model.js";

const returnWindowDay =
  process.env.RETURN_WINDOW_DAYS !== undefined
    ? Number(process.env.RETURN_WINDOW_DAYS)
    : -1;

logger.info(`RETURN WINDOW DAYS: ${returnWindowDay} days import successful`);

const TYPE_MODEL = { warranty: Warranty, guarantee: Guarantee, return: Return };
const CUSTOMER_SELECT = "-password -loginAttempts -lockUntil";

export const getOrderServiceClaim = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { type, status } = req.query;

    const filter = status ? { status } : {};
    const typesToQuery = type ? [type] : ["warranty", "guarantee", "return"];

    const populateOpts = [
      { path: "product" },
      { path: "createdBy", select: CUSTOMER_SELECT },
      { path: "updatedBy", select: CUSTOMER_SELECT },
      {
        path: "order",
        populate: [
          { path: "customerId", select: CUSTOMER_SELECT },
          { path: "createdBy", select: CUSTOMER_SELECT },
        ],
      },
    ];

    const results = await Promise.all(
      typesToQuery.map(async (t) => {
        const Model = TYPE_MODEL[t];
        const docs = await Model.find(filter)
          .populate(populateOpts)
          .sort({ createdAt: -1 })
          .lean();
        return docs.map((d) => ({ ...d, type: t }));
      }),
    );

    const merged = results
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paged = merged.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      message: "Order service claims retrieved successfully",
      data: paged,
      hasMore: skip + limit < merged.length,
      total: merged.length,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const createOrderServiceClaim = async (req, res) => {
  try {
    const { order, product, type, resolution, reason, notes } = req.body;
    const qty = Number(req.body.qty);

    const userId = req.userId;
    const username = req.username;

    if (!order || !product || !type || !qty) {
      return res.status(400).json({
        message:
          "Missing required data: order, product, type, and qty are required.",
      });
    }

    if (type === "return") {
      if (returnWindowDay < 0) {
        return res
          .status(403)
          .json({ message: "Returns are not allowed for this store." });
      }
    }

    const [productData, orderData] = await Promise.all([
      Product.findById(product).lean(), // use lean() for faster read
      Order.findById(order).lean(),
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
        return res
          .status(403)
          .json({ message: "Returns are not allowed for this store." });
      }
      daysToAdd = returnWindowDay;
    } else if (type === "warranty") {
      if (!productData.warranty) {
        return res
          .status(403)
          .json({ message: "This product has no warranty." });
      }
      daysToAdd = productData.warranty;
    } else if (type === "guarantee") {
      if (!productData.guarantee) {
        return res
          .status(403)
          .json({ message: "This product has no guarantee." });
      }
      daysToAdd = productData.guarantee;
    }
    serviceClaimDate.setDate(
      serviceClaimDate.getDate() + (Number(daysToAdd) || 0),
    );

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
      const latestClaim = allClaims.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];
      aggregatedResult = { ...latestClaim, qty: serviceQty };
    }

    logger.info(
      { serviceQty, aggregatedResult },
      `Calculated claim quantities for order ${order} by ${username} : ${userId}`,
    );

    const orderItem = orderData.items?.find(
      (item) => item?.product.toString() === product,
    );
    const orderQty = orderItem?.qty || 0;

    if (orderQty < serviceQty) {
      return res
        .status(403)
        .json({ message: "No product left in order to claim." });
    }

    if (serviceQty + qty > orderQty) {
      return res.status(403).json({
        message: "Requested claim quantity exceeds available products.",
      });
    }

    // --- Create Claim ---
    let createdClaim;
    const claimPayload = {
      order,
      product,
      qty,
      resolution,
      notes,
      claimed: false,
      createdBy: userId,
    };

    if (type === "warranty") {
      createdClaim = await Warranty.create(claimPayload);
    } else if (type === "return") {
      createdClaim = await Return.create({ ...claimPayload, reason });
    } else if (type === "guarantee") {
      createdClaim = await Guarantee.create(claimPayload);
    } else {
      return res.status(400).json({ message: "Invalid claim type provided." });
    }

    logger.info(
      `Successfully created ${type} claim for order ${order} by ${username} : ${userId}`,
    );

    return res.status(201).json({
      message: `${type} claim submitted successfully.`,
      data: createdClaim,
    });
  } catch (error) {
    logger.error(error, "Error creating order service claim");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderServiceClaimStatus = async (req, res) => {
  try {
    const { type, id, status, claimed } = req.body?.payload || {};

    const userId = req.userId;
    const username = req.username;

    if (!type || !id || (!status && claimed === undefined)) {
      return res.status(400).json({
        message:
          "Missing required parameters (type, id, and status or claimed flag are required)",
      });
    }

    const models = { return: Return, warranty: Warranty, guarantee: Guarantee };

    const SelectedModel = models[type?.toLowerCase()];

    if (!SelectedModel) {
      return res.status(400).json({
        message:
          "Invalid type provided. Must be 'return', 'warranty', or 'guarantee'.",
      });
    }

    const updatePayload = {
      ...(status && { status }),
      ...(claimed !== undefined && { isClaimed: claimed }),
      updatedBy: userId,
    };

    const serviceData = await SelectedModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true },
    );

    if (!serviceData) {
      return res
        .status(404)
        .json({ message: "Service claim record not found" });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      data: serviceData,
    });
  } catch (error) {
    console.error("Error updating service claim status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
