import mongoose from "mongoose";
import Product from "../../models/Product.model.js";
import Order from "../../models/Order.model.js";
import { checkViolation_ProductData } from "../../utility/ViolationsUtility/checkViolation_ProductData.js";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";

export const createOrder = async (req, res) => {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const userId = "6a26afd080bda9f8dc7d8dcc";
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!userId) {
        await session.abortTransaction();
        session.endSession();
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

      console.log(req.body);

      const { paidAmount, discountAmount, subtotal, total } = payment || {};

      if (!customerId && (!username?.trim() || !mobile?.trim())) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message:
            "Bad Request: Provide a customerId OR both username and mobile numbers.",
        });
      }

      if (!payment || paidAmount === undefined || discountAmount === undefined) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message:
            "Bad Request: payment object requires paidAmount and discountAmount fields.",
        });
      }

      if (subtotal === undefined || total === undefined) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Bad Request: 'subtotal' and 'total' fields are required.",
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Bad Request: items must be a non-empty array." });
      }

      const location = req.body.location || items[0]?.location;

      if (!location || !location.shelveId) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Bad Request: Target shelf location is missing." });
      }

      for (const item of items) {
        if (!item.productInfo) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Bad Request: Each item must have a productInfo ID.",
          });
        }
        if (!item.qty || typeof item.qty !== "number" || item.qty <= 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message:
              "Bad Request: Each item must have a valid qty greater than 0.",
          });
        }
        if (!item.price || typeof item.price !== "number" || item.price <= 0) {
          await session.abortTransaction();
          session.endSession();
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

      console.log(violationStatus);

      if (violationStatus.isBlocked) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Order blocked due to severe pricing/data violations.",
          violations: violationStatus.violations.filter(
            (v) => v.violationLevel <= 2,
          ),
        });
      }

      const findShelve = await Shelve.findById(location.shelveId).session(
        session,
      );
      if (!findShelve) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Shelf location not found." });
      }

      for (const item of items) {
        const shelfProductIndex = findShelve.productData.findIndex(
          (p) =>
            p.productInfo.toString() === item.productInfo.toString() &&
            !p.isDeleted,
        );

        if (shelfProductIndex === -1) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Bad Request: Product ID ${item.productInfo} is not assigned to this shelf.`,
          });
        }

        const shelfProduct = findShelve.productData[shelfProductIndex];

        if (shelfProduct.stock.inStock < item.qty) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Insufficient stock on this shelf for product. Available: ${shelfProduct.stock.inStock}, Requested: ${item.qty}`,
          });
        }

        shelfProduct.stock.inStock -= item.qty;
        shelfProduct.updatedBy = userId;
      }

      await findShelve.save({ session });

      const newOrderData = {
        createdBy: userId,
        items: items.map((item) => ({
          product: item.productInfo,
          qty: item.qty,
          price: item.price,
        })),
        payment: {
          status: payment.status || "paid",
          paidAmount: payment.paidAmount,
          discountAmount: payment.discountAmount,
        },
        dueAmount: total - paidAmount,
        status,
        warehouselocation: {
          warehouse: warehouseId,
          rack: findShelve.rackData,
          shelve: findShelve._id,
        },
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

      console.log(newOrderData);

      const [savedOrder] = await Order.create([newOrderData], { session });

      await session.commitTransaction();
      session.endSession();

      let finalMessage = "Order verified and created successfully!";
      if (violationStatus.warnings.length > 0) {
        finalMessage =
          "Order created successfully, but a Level 3 pricing warning was recorded.";
      }

      return res.status(201).json({
        success: true,
        message: finalMessage,
        data: savedOrder,
        warnings: violationStatus.warnings,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      const isWriteConflict =
        error.errorLabels &&
        error.errorLabels.includes("TransientTransactionError");

      if (isWriteConflict && attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 50 + 50),
        );
        continue;
      }

      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};