import mongoose from "mongoose";
import Product from "../../models/Product.model.js";
import Order from "../../models/Order.model.js";
import { checkViolation_ProductData } from "../../utility/ViolationsUtility/checkViolation_ProductData.js";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";
import todaySalesSse from "../../utility/sseManager/todaySalesSse.js";
import { logger } from "../../config/logger.js";

export const getOrderStream = async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  todaySalesSse.addClient(res);

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orderData = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate(
        "createdBy",
        "username displayName email phone roleTitle employeeId photoUrl",
      )
      .populate(
        "customerId",
        "username displayName email phone address photoUrl",
      )
      .populate("items.product", "displayId name brand pricing barcodes image");

    res.write(`data: ${JSON.stringify(orderData)}\n\n`);
  } catch (error) {
    console.error("Error fetching initial orders:", error);
    res.write(
      `data: ${JSON.stringify({ error: "Failed to load initial data" })}\n\n`,
    );
  }

  req.on("close", () => {
    todaySalesSse.removeClient(res);
    res.end();
  });
};

export const createOrder = async (req, res) => {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const userId = req.userId;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (!userId) {
        await session.abortTransaction();
        return res
          .status(401)
          .json({ message: "Unauthorized: User ID is missing." });
      }

      const {
        customerId,
        username,
        mobile,
        address,
        items,
        payment,
        email,
        warehouseId,
        status,
      } = req.body;

      const { paidAmount, discountAmount, subtotal, total } = payment || {};

      if (!customerId && (!username?.trim() || !mobile?.trim())) {
        await session.abortTransaction();
        return res.status(400).json({
          message:
            "Bad Request: Provide a customerId OR both username and mobile numbers.",
        });
      }

      if (
        !payment ||
        paidAmount === undefined ||
        discountAmount === undefined
      ) {
        await session.abortTransaction();
        return res.status(400).json({
          message:
            "Bad Request: payment object requires paidAmount and discountAmount fields.",
        });
      }

      if (subtotal === undefined || total === undefined) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Bad Request: 'subtotal' and 'total' fields are required.",
        });
      }

      if (!warehouseId) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Bad Request: warehouseId is required." });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Bad Request: items must be a non-empty array." });
      }

      for (const item of items) {
        if (!item.productInfo) {
          await session.abortTransaction();
          return res.status(400).json({
            message: "Bad Request: Each item must have a productInfo ID.",
          });
        }
        if (!item.qty || typeof item.qty !== "number" || item.qty <= 0) {
          await session.abortTransaction();
          return res.status(400).json({
            message:
              "Bad Request: Each item must have a valid qty greater than 0.",
          });
        }
        if (!item.price || typeof item.price !== "number" || item.price <= 0) {
          await session.abortTransaction();
          return res.status(400).json({
            message: "Bad Request: Each item must include a valid price.",
          });
        }
      }

      const violationStatus = await checkViolation_ProductData(
        items,
        warehouseId,
        subtotal,
        total,
        userId,
        req.ip,
      );

      if (violationStatus.isBlocked) {
        await session.abortTransaction();
        logger.warn(
          { userId, warehouseId, violations: violationStatus.violations },
          "Order blocked due to pricing violations",
        );
        return res.status(400).json({
          success: false,
          message: "Order blocked due to severe pricing/data violations.",
          violations: violationStatus.violations.filter(
            (v) => v.violationLevel <= 2,
          ),
        });
      }

      const shelfIds = [
        ...new Set(items.map((i) => i.shelveId).filter(Boolean)),
      ];

      const shelves = shelfIds.length
        ? await Shelve.find({ _id: { $in: shelfIds } }).session(session)
        : [];
      const shelfById = new Map(shelves.map((s) => [s._id.toString(), s]));

      if (shelfIds.length !== shelfById.size) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ message: "One or more shelf locations were not found." });
      }

      for (const shelf of shelves) {
        if (shelf.warehouse_Id.toString() !== warehouseId.toString()) {
          await session.abortTransaction();
          return res.status(400).json({
            message:
              "Bad Request: One or more shelves belong to a different warehouse than the order's warehouseId.",
          });
        }
      }

      const touchedShelfIds = new Set();

      for (const item of items) {
        if (!item.shelveId) continue;

        const shelf = shelfById.get(item.shelveId);
        const shelfProductIndex = shelf.productData.findIndex(
          (p) =>
            p.productInfo.toString() === item.productInfo.toString() &&
            !p.isDeleted,
        );

        if (shelfProductIndex === -1) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Bad Request: Product ID ${item.productInfo} is not assigned to shelf ${item.shelveId}.`,
          });
        }

        const shelfProduct = shelf.productData[shelfProductIndex];

        if (shelfProduct.stock.inStock < item.qty) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock on a shelf for one of the products. Available: ${shelfProduct.stock.inStock}, Requested: ${item.qty}`,
          });
        }

        shelfProduct.stock.inStock -= item.qty;
        shelfProduct.updatedBy = userId;
        touchedShelfIds.add(item.shelveId);
      }

      for (const id of touchedShelfIds) {
        await shelfById.get(id).save({ session });
      }

      const calculatedDue = paidAmount < total ? total - paidAmount : 0;
      const calculatedReturn = paidAmount > total ? paidAmount - total : 0;
      const computedPaymentStatus = paidAmount >= total ? "paid" : "due";

      const newOrderData = {
        createdBy: userId,
        items: items.map((item) => {
          const shelf = item.shelveId ? shelfById.get(item.shelveId) : null;
          return {
            product: item.productInfo,
            qty: item.qty,
            price: item.price,
            ...(shelf
              ? {
                  location: {
                    shelve: shelf._id,
                    rack: shelf.rackData,
                  },
                }
              : {}),
          };
        }),
        payment: {
          status: computedPaymentStatus,
          paidAmount,
          discountAmount,
        },
        warehouseData: warehouseId,
        status: status || "pending",
        dueAmount: calculatedDue,
        returnAmount: calculatedReturn,
      };

      if (customerId) {
        newOrderData.customerId = customerId;
      } else {
        newOrderData.guestCustomer = {
          username: username.trim(),
          mobile: mobile.trim(),
          address: address?.trim() || "",
          email: email?.trim() || "",
        };
      }

      const [savedOrder] = await Order.create([newOrderData], { session });
      await session.commitTransaction();

      const populatedOrder = await Order.findById(savedOrder._id)
        .populate(
          "createdBy",
          "username displayName email phone roleTitle employeeId photoUrl",
        )
        .populate(
          "customerId",
          "username displayName email phone address photoUrl",
        );

      let finalMessage = "Order verified and created successfully!";
      if (violationStatus.warnings.length > 0) {
        finalMessage =
          "Order created successfully, but a Level 3 pricing warning was recorded.";
      }

      todaySalesSse.broadcast({
        event: "NEW_ORDER",
        orderData: populatedOrder,
      });

      logger.info(
        { orderId: savedOrder._id, userId, warehouseId },
        "Order created successfully",
      );

      return res.status(201).json({
        success: true,
        message: finalMessage,
        data: populatedOrder,
        warnings: violationStatus.warnings,
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      const isWriteConflict =
        error.errorLabels &&
        error.errorLabels.includes("TransientTransactionError");

      if (isWriteConflict && attempt < MAX_RETRIES) {
        logger.warn(
          { attempt, error: error.message },
          "Transient transaction error encountered, retrying...",
        );
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 50 + 50),
        );
        continue;
      }

      logger.error({ err: error, userId }, "Error creating order");
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      session.endSession();
    }
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status, paidAmount } = req.body;
    const userId = req.userId;

    const incomingPayment = Number(paidAmount);
    if (isNaN(incomingPayment) || incomingPayment < 0) {
      return res.status(400).send({
        success: false,
        message: "Must provide a valid payment amount!",
      });
    }

    const orderData = await Order.findById(orderId);
    if (!orderData) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }

    if (orderData.status === "complete") {
      return res.status(400).send({
        success: false,
        message: "Cannot modify a completed order.",
      });
    }

    const previousPaid = Number(orderData.payment?.paidAmount) || 0;
    const totalPaid = previousPaid + incomingPayment;

    const totalPrice =
      orderData.items?.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0,
      ) || 0;

    const rawDue = totalPrice - totalPaid;
    const dueAmount = Math.max(0, Math.ceil(rawDue));

    if (status) orderData.status = status;
    orderData.payment.paidAmount = totalPaid;
    orderData.dueAmount = dueAmount;

    if (totalPaid >= totalPrice) {
      orderData.payment.status = "paid";
    } else if (totalPaid > 0) {
      orderData.payment.status = "partially_paid";
    } else {
      orderData.payment.status = "unpaid";
    }

    orderData.updatedBy = userId;

    await orderData.save();

    return res.status(200).send({
      success: true,
      message: "Order updated successfully",
      data: orderData,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateOrder = async (req, res) => {};
