import mongoose from "mongoose";
import Product from "../../models/Product.model.js";

export const createOrder = async (req, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID is missing." });
    }

    const { customerId, username, mobile, address, items, payment, email } =
      req.body;

    if (!customerId && (!username?.trim() || !mobile?.trim())) {
      return res.status(400).json({
        message:
          "Bad Request: Provide a customerId OR both username and mobile numbers.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad Request: items must be a non-empty array." });
    }

    if (
      !payment ||
      payment.paidAmount === undefined ||
      payment.discountAmount === undefined
    ) {
      return res.status(400).json({
        message:
          "Bad Request: payment object requires paidAmount and discountAmount fields.",
      });
    }

    for (const item of items) {
      if (!item.productInfo) {
        return res.status(400).json({
          message: "Bad Request: Each item must have a productInfo ID.",
        });
      }
      if (
        item.qty === undefined ||
        typeof item.qty !== "number" ||
        item.qty <= 0
      ) {
        return res.status(400).json({
          message:
            "Bad Request: Each item must have a valid qty greater than 0.",
        });
      }
      if (
        item.price === undefined ||
        typeof item.price !== "number" ||
        item.price <= 0
      ) {
        return res.status(400).json({
          message: "Bad Request: Each item must include a valid price.",
        });
      }
    }

    const itemsWithObjectIds = items.map((item) => ({
      productInfo: new mongoose.Types.ObjectId(item.productInfo),
      price: Number(item.price),
    }));

    const productIds = itemsWithObjectIds.map((item) => item.productInfo);

    const priceVerification = await Product.aggregate([
      {
        $match: { _id: { $in: productIds } },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sellPrice: "$pricing.sellPrice",
          mrp: "$pricing.mrp",
          inputItem: {
            $arrayElemAt: [
              {
                $filter: {
                  input: itemsWithObjectIds,
                  as: "i",
                  cond: { $eq: ["$$i.productInfo", "$_id"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $lt: ["$inputItem.price", "$sellPrice"] },
              { $gt: ["$inputItem.price", "$mrp"] },
            ],
          },
        },
      },
    ]);

    if (priceVerification.length > 0) {
      const failed = priceVerification[0];
      return res.status(400).json({
        success: false,
        message: `Price validation failed for product '${failed.name}'. The price must be between or equal to the selling price (${failed.sellPrice ?? 0}) and the MRP (${failed.mrp ?? 0}).`,
      });
    }

    

    const newOrderData = {
      createdBy: req.userId,
      items: items.map((item) => ({
        product: item.productInfo,
        qty: item.qty,
        price: item.price,
      })),
      payment: {
        paidAmount: payment.paidAmount,
        discountAmount: payment.discountAmount,
        status: payment.status || "Paid",
      },
      status: "pending",
    };

    if (customerId) {
      newOrderData.customer = customerId;
    } else {
      newOrderData.guestCustomer = {
        username: username.trim(),
        mobile: mobile.trim(),
        address: address?.trim() || "",
        email: email?.trim() || "",
      };
    }

    return res.status(401).json({
      success: true,
      message: "Order verified and created successfully!",
      data: newOrderData,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
