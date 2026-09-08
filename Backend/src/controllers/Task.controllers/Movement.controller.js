import { logger } from "../../config/logger.js";
import Movement from "../../models/Tasks/Movement.model.js";
import EmergencyTask from "../../models/Tasks/EmergencyTask.model.js";
import mongoose from "mongoose";
import { Shelve } from "../../models/Warehouse.models/shelve.models.js";

export const getMovements = async (req, res) => {
  try {
    const { type, limit } = req.query;

    const query = {};
    if (type) {
      query.type = type;
    }

    const movements = await Movement.find(query)
      .limit(limit ? parseInt(limit) : 0)
      .sort({ createdAt: -1 })
      .populate("items.productData", "name sku image brand displayId")
      .populate("supplier", "name companyName")
      .populate("fromWarehouseId", "warehouseName warehouseId")
      .populate("toWarehouseId", "warehouseName warehouseId")
      .populate("receivedBy", "username displayName photoUrl")
      .populate("dispatchedBy", "username displayName photoUrl")
      .populate("createdBy", "username displayName photoUrl")
      .populate("verification.verifiedBy", "username displayName photoUrl");

    logger.info(
      `Fetched ${movements.length} movements. Type filter: "${type || "none"}"`,
    );

    return res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    logger.error(`Error fetching movements: ${error.message}`, { error });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const verifyMovement = async (req, res) => {
  let session;
  try {
    const { status, note, verificationMode = "verify_only", items } = req.body || {};
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be verified or rejected." });
    }
    if (!["verify_only", "verify_and_put"].includes(verificationMode)) {
      return res.status(400).json({ success: false, message: "Invalid verification mode." });
    }
    session = await mongoose.startSession();
    session.startTransaction();
    const movement = await Movement.findById(req.params.id).session(session);
    if (!movement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Movement not found." });
    }
    const isCompletingInboundPutAway =
      movement.type === "inbound" &&
      movement.verification?.status === "verified" &&
      movement.verification?.mode === "verify_only" &&
      verificationMode === "verify_and_put" &&
      status === "verified";
    if (movement.verification?.status === "verified" && !isCompletingInboundPutAway) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ success: false, message: "This movement has already been verified." });
    }
    if (movement.type === "outbound" && verificationMode !== "verify_only") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Outbound tasks only support verification." });
    }
    if (status === "verified") {
      const movementItems = Array.isArray(items) ? items : movement.items;
      const inboundAllocations = (item) =>
        Array.isArray(item.destinationLocations) && item.destinationLocations.length > 0
          ? item.destinationLocations
          : item.destinationLocation
            ? [{ ...item.destinationLocation, qty: item.receivedQty ?? item.qty }]
            : [];
      if (movement.type === "inbound" && verificationMode === "verify_and_put") {
        for (const item of movementItems) {
          const confirmedQty = Number(
            item.receivedQty === "" || item.receivedQty === undefined
              ? item.qty
              : item.receivedQty,
          );
          const allocations = inboundAllocations(item).map((location, index, allLocations) => ({
            ...location,
            qty:
              (location.qty === "" || location.qty === undefined) && allLocations.length === 1
                ? confirmedQty
                : Number(location.qty),
          }));
          const allocatedQty = allocations.reduce((sum, location) => sum + Number(location.qty), 0);
          if (
            confirmedQty <= 0 ||
            allocations.length === 0 ||
            allocations.some((location) => !location.rackId || !location.shelfId || Number(location.qty) <= 0) ||
            Math.abs(allocatedQty - confirmedQty) > 0.000001
          ) {
            throw new Error("Each inbound product must have rack, shelve, and quantities that total the confirmed quantity.");
          }
          item.destinationLocations = allocations;
        }
      }
      const shelfIds = movementItems.flatMap((item) => [
        item.sourceLocation?.shelfId,
        ...inboundAllocations(item).map((location) => location.shelfId),
      ]).filter(Boolean);
      const shelves = await Shelve.find({ _id: { $in: [...new Set(shelfIds.map(String))] } }).session(session);
      const shelfById = new Map(shelves.map((shelf) => [shelf._id.toString(), shelf]));
      for (const item of movementItems) {
        const quantity = item.receivedQty === "" || item.receivedQty === undefined
          ? Number(item.qty)
          : Number(item.receivedQty);
        const productId = item.productData?._id || item.productData;
        if (movement.type === "outbound") {
          const location = item.sourceLocation;
          const shelf = shelfById.get(location?.shelfId?.toString());
          const stock = shelf?.productData.find((entry) => entry.productInfo.toString() === productId.toString() && !entry.isDeleted);
          if (!shelf || !stock) throw new Error("Outbound source shelves must contain every product.");
          if (stock.stock.inStock < quantity) throw new Error(`Insufficient stock for product ${productId}.`);
          stock.stock.inStock -= quantity;
          stock.updatedBy = req.userId;
          await shelf.save({ session });
        } else if (verificationMode === "verify_and_put") {
          for (const location of inboundAllocations(item)) {
            const shelf = shelfById.get(location.shelfId?.toString());
            if (!shelf) throw new Error("Select destination shelves for every inbound product.");
            const allocationQty = Number(location.qty);
            let stock = shelf.productData.find((entry) => entry.productInfo.toString() === productId.toString() && !entry.isDeleted);
            if (!stock) {
              shelf.productData.push({ productInfo: productId, stock: { inStock: 0, maxStock: allocationQty }, createdBy: req.userId });
              stock = shelf.productData[shelf.productData.length - 1];
            }
            stock.stock.inStock = Number(stock.stock.inStock || 0) + allocationQty;
            stock.updatedBy = req.userId;
            await shelf.save({ session });
          }
        }
      }
    }
    movement.verification = {
      mode: verificationMode,
      status,
      note: note || "",
      verifiedBy: req.userId,
      verifiedAt: new Date(),
    };
    if (Array.isArray(items)) movement.items = items;
    await movement.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.json({ success: true, data: movement });
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction();
    session?.endSession();
    logger.error(`Error verifying movement: ${error.message}`, { error });
    const isValidationError =
      error.message?.includes("must have rack") ||
      error.message?.includes("Select destination shelves") ||
      error.message?.includes("Outbound source shelves") ||
      error.message?.includes("Insufficient stock");
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError ? error.message : "Internal server error",
    });
  }
};

export const recordMovementDiscrepancy = async (req, res) => {
  try {
    const { items, note } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one discrepancy item is required." });
    }
    const movement = await Movement.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          items: items.map((item) => ({
            productData: item.productData,
            qty: Number(item.qty) || 0,
            receivedQty: item.receivedQty === "" ? undefined : Number(item.receivedQty),
            discrepancyNote: item.discrepancyNote || "",
            sourceLocation: item.sourceLocation,
            destinationLocation: item.destinationLocation,
            destinationLocations: item.destinationLocations,
          })),
          "discrepancy.status": "recorded",
          "discrepancy.note": note || "",
          "discrepancy.recordedBy": req.userId,
          "discrepancy.recordedAt": new Date(),
          "verification.status": "pending",
        },
      },
      { new: true, runValidators: true },
    );
    if (!movement) return res.status(404).json({ success: false, message: "Movement not found." });
    await EmergencyTask.create({
      title: `${movement.type === "inbound" ? "Inbound shortage" : "Outbound quantity mismatch"}: ${movement.reference || movement._id}`,
      description: note || "Inventory quantities do not match the movement task.",
      priority: "critical",
      relatedType: "movement",
      relatedId: movement._id,
      createdBy: req.userId,
    });
    return res.json({ success: true, data: movement });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not record discrepancy." });
  }
};

export const updateMovement = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Inbound and outbound tasks cannot be edited.",
  });
};

export const createMovement = async (req, res) => {
  try {
    const movementData = req.body || {};
    const userId = req.userId;
    const username = req.username;

    if (!movementData?.type || !["inbound", "outbound"].includes(movementData.type)) {
      logger.warn(
        `User ${username} (ID: ${userId}) attempted to create a movement without a type.`,
      );
      return res
        .status(400)
        .json({ success: false, message: "Movement type is required." });
    }
    if (!Array.isArray(movementData.items) || movementData.items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product is required." });
    }
    if (
      movementData.type === "outbound" &&
      movementData.items.some((item) => !item.sourceLocation?.rackId || !item.sourceLocation?.shelfId)
    ) {
      return res.status(400).json({ success: false, message: "Each outbound product requires a source rack and shelves." });
    }

    const payload = {
      type: movementData.type,
      date: movementData.date || new Date(),
      reference: movementData.reference,
      notes: movementData.notes || "",
      items: movementData.items || [],
      destinationType: movementData.destinationType,
      fromWarehouseId: movementData.fromWarehouseId,
      toWarehouseId: movementData.toWarehouseId,
      trackCode: movementData.trackCode,
      supplier: movementData.supplier || undefined,
      supplyDate: movementData.supplyDate,
      dispatchedBy: movementData.dispatchedBy,
      receivedBy: movementData.receivedBy,
      createdBy: userId,
    };

    logger.info(
      `User ${username} (ID: ${userId}) creating '${payload.type}' movement`,
    );

    const movement = await Movement.create(payload);

    logger.info(`Movement ${movement._id} created successfully by ${username}`);

    return res.status(201).json({ success: true, data: movement });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      logger.warn(`Validation Error by user ${req.username}: ${error.message}`);
      return res.status(400).json({ success: false, message: error.message });
    }

    logger.error("Error creating movement:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
